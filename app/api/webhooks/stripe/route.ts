import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { info, warn, error } from '@/lib/serverLogger';

/**
 * STRIPE WEBHOOK HANDLER
 * Processes Stripe payment events:
 * - checkout.session.completed (payment successful)
 * - customer.subscription.updated (plan changed)
 * - invoice.payment_failed (retry needed)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    info(`[Stripe Webhook] Event: ${type}`);

    switch (type) {
      case 'checkout.session.completed': {
        const { customer_email, metadata, amount_total } = data.object;
        const { userId, tier } = metadata || {};

        if (!userId || !customer_email) {
          warn('Missing userId or email in checkout');
          return NextResponse.json({ received: true });
        }

        // Find user
        const usersQuery = query(collection(db, 'users'), where('email', '==', customer_email));
        const usersSnap = await getDocs(usersQuery);

        if (usersSnap.empty) {
          warn(`User not found: ${customer_email}`);
          return NextResponse.json({ received: true });
        }

        const userDoc = usersSnap.docs[0];
        const userRef = doc(db, 'users', userDoc.id);

        // Update subscription
        await updateDoc(userRef, {
          tier: tier || 'pro',
          subscription: {
            plan: tier || 'pro',
            status: 'active',
            startDate: new Date().toISOString(),
            autoRenew: true,
          },
        });

        // Log transaction
        await addDoc(collection(db, 'transactions'), {
          userId: userDoc.id,
          email: customer_email,
          tier: tier || 'pro',
          amount: (amount_total || 0) / 100, // Convert cents to dollars
          paymentMethod: 'stripe',
          transactionId: data.object.id,
          status: 'completed',
          createdAt: new Date(),
          type: 'subscription_upgrade',
        });

        info(`✅ Stripe: ${customer_email} upgraded to ${tier}`);
        break;
      }

      case 'customer.subscription.updated': {
        const { customer, items, status } = data.object;
        const planId = items.data[0]?.plan.id;

        // Map Stripe price IDs to tiers
        const tierMap: Record<string, string> = {
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '']: 'pro',
          [process.env.REDACTED_SECRET_Generic_long_secret || '']: 'enterprise',
        };

        const tier = tierMap[planId] || 'free';

        // Find user by Stripe customer ID
        const usersQuery = query(
          collection(db, 'users'),
          where('stripeCustomerId', '==', customer)
        );
        const usersSnap = await getDocs(usersQuery);

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            tier,
            subscription: { plan: tier, status },
          });

          info(`✅ Stripe: Subscription updated - ${userDoc.data().email} → ${tier}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const { customer_email } = data.object;

        const usersQuery = query(collection(db, 'users'), where('email', '==', customer_email));
        const usersSnap = await getDocs(usersQuery);

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];

          // Log failed payment
          await addDoc(collection(db, 'transactions'), {
            userId: userDoc.id,
            email: customer_email,
            status: 'failed',
            type: 'payment_failed',
            createdAt: new Date(),
            retryable: true,
          });

          warn(`⚠️ Stripe: Payment failed for ${customer_email}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
