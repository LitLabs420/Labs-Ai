import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { info, warn, error } from '@/lib/serverLogger';

/**
 * PAYPAL WEBHOOK HANDLER
 * Processes PayPal subscription events:
 * - BILLING.SUBSCRIPTION.CREATED (subscription activated)
 * - BILLING.SUBSCRIPTION.UPDATED (plan changed)
 * - PAYMENT.CAPTURE.COMPLETED (payment successful)
 * - PAYMENT.CAPTURE.REFUNDED (refund issued)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, resource } = body;

    info(`[PayPal Webhook] Event: ${event_type}`);

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED': {
        const { id: subscriptionId, custom_id: customId, payer } = resource;
        const customerEmail = payer?.email_address;

        if (!customId || !customerEmail) {
          warn('Missing custom_id or payer email');
          return NextResponse.json({ received: true });
        }

        // Find user
        const usersQuery = query(collection(db, 'users'), where('email', '==', customerEmail));
        const usersSnap = await getDocs(usersQuery);

        if (usersSnap.empty) {
          warn(`User not found: ${customerEmail}`);
          return NextResponse.json({ received: true });
        }

        const userDoc = usersSnap.docs[0];

        // Parse custom_id: "user_id:tier"
        const [, tier] = customId.split(':');

        await updateDoc(doc(db, 'users', userDoc.id), {
          tier: tier || 'pro',
          paypalSubscriptionId: subscriptionId,
          subscription: {
            plan: tier || 'pro',
            status: 'active',
            startDate: new Date().toISOString(),
            provider: 'paypal',
          },
        });

        info(`✅ PayPal: ${customerEmail} subscribed to ${tier}`);
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const { supplementary_data, amount, payer } = resource;
        const { related_ids } = supplementary_data || {};
        const subscriptionId = related_ids?.subscription_id;
        const customerEmail = payer?.email_address;

        if (!subscriptionId || !customerEmail) {
          console.warn('Missing subscription or payer info');
          return NextResponse.json({ received: true });
        }

        // Find user by PayPal subscription ID
        const usersQuery = query(
          collection(db, 'users'),
          where('paypalSubscriptionId', '==', subscriptionId)
        );
        const usersSnap = await getDocs(usersQuery);

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          const tierMap: Record<string, string> = {
            '99.00': 'pro',
            '299.00': 'enterprise',
          };

          const tier = tierMap[amount?.value || ''] || userDoc.data().tier;

          // Log transaction
          await addDoc(collection(db, 'transactions'), {
            userId: userDoc.id,
            email: customerEmail,
            tier,
            amount: parseFloat(amount?.value || '0'),
            paymentMethod: 'paypal',
            transactionId: resource.id,
            status: 'completed',
            createdAt: new Date(),
            type: 'subscription_payment',
          });

          info(`✅ PayPal: Payment received from ${customerEmail} for ${tier}`);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const { id: subscriptionId, status, payer } = resource;

        // Find user by PayPal subscription ID
        const usersQuery = query(
          collection(db, 'users'),
          where('paypalSubscriptionId', '==', subscriptionId)
        );
        const usersSnap = await getDocs(usersQuery);

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];

          // Handle cancellation
          if (status === 'CANCELLED') {
            await updateDoc(doc(db, 'users', userDoc.id), {
              tier: 'free',
              subscription: {
                plan: 'free',
                status: 'cancelled',
              },
            });

            warn(`⚠️ PayPal: ${payer?.email_address} cancelled subscription`);
          } else {
            await updateDoc(doc(db, 'users', userDoc.id), {
              subscription: {
                status,
              },
            });

            console.log(`✅ PayPal: Subscription updated - ${payer?.email_address} → ${status}`);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const { supplementary_data, amount, payer } = resource;
        const { related_ids } = supplementary_data || {};
        const subscriptionId = related_ids?.subscription_id;

        if (subscriptionId) {
          const usersQuery = query(
            collection(db, 'users'),
            where('paypalSubscriptionId', '==', subscriptionId)
          );
          const usersSnap = await getDocs(usersQuery);

          if (!usersSnap.empty) {
            const userDoc = usersSnap.docs[0];

            // Log refund
            await addDoc(collection(db, 'transactions'), {
              userId: userDoc.id,
              email: payer?.email_address,
              amount: -parseFloat(amount?.value || '0'),
              paymentMethod: 'paypal',
              transactionId: resource.id,
              status: 'refunded',
              createdAt: new Date(),
              type: 'refund',
            });

            info(`✅ PayPal: Refund processed for ${payer?.email_address}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
    error('PayPal webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
