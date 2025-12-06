import { NextRequest, NextResponse } from 'next/server';
import { info, warn, error } from '@/lib/serverLogger';
import { getAdminDb } from '@/lib/firebase-admin';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import Stripe from 'stripe';

// Initialize Stripe client (use account default API version)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * STRIPE WEBHOOK HANDLER
 * Processes Stripe payment events:
 * - checkout.session.completed (payment successful)
 * - customer.subscription.updated (plan changed)
 * - invoice.payment_failed (retry needed)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      error('[Stripe Webhook] Missing signature or webhook secret');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (!stripe) {
      error('[Stripe Webhook] Stripe client not initialized');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const { type, data } = event;

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
        const dbRef = getAdminDb();
        if (!dbRef) {
          warn('Firestore Admin not initialized');
          return NextResponse.json({ received: true });
        }
        const usersSnap = await dbRef
          .collection('users')
          .where('email', '==', customer_email)
          .get();

        if (usersSnap.empty) {
          warn(`User not found: ${customer_email}`);
          return NextResponse.json({ received: true });
        }

        const userDoc = usersSnap.docs[0];

        // Update subscription
        await dbRef
          .collection('users')
          .doc(userDoc.id)
          .update({
            tier: tier || 'pro',
            subscription: {
              plan: tier || 'pro',
              status: 'active',
              startDate: new Date().toISOString(),
              autoRenew: true,
            },
          });

        // Log transaction
        await dbRef.collection('transactions').add({
          userId: userDoc.id,
          email: customer_email,
          tier: tier || 'pro',
          amount: (amount_total || 0) / 100, // Convert cents to dollars
          paymentMethod: 'stripe',
          transactionId: (data.object as any).id,
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
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
        };

        const tier = tierMap[planId] || 'free';

        // Find user by Stripe customer ID
        const dbRef = getAdminDb();
        if (!dbRef) {
          warn('Firestore Admin not initialized');
          return NextResponse.json({ received: true });
        }
        const usersSnap = await dbRef
          .collection('users')
          .where('stripeCustomerId', '==', customer)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          await dbRef
            .collection('users')
            .doc(userDoc.id)
            .update({
              tier,
              subscription: { plan: tier, status },
            });

          info(`✅ Stripe: Subscription updated - ${userDoc.data().email} → ${tier}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const { customer_email } = data.object;

        const dbRefInvoice = getAdminDb();
        if (!dbRefInvoice) {
          warn('Firestore Admin not initialized');
          return NextResponse.json({ received: true });
        }
        const usersSnap = await dbRefInvoice
          .collection('users')
          .where('email', '==', customer_email)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];

          // Log failed payment
          await dbRefInvoice.collection('transactions').add({
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
