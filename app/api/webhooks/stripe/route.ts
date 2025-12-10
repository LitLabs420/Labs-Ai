import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
let adminDb: ReturnType<typeof getFirestore>;

try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  adminDb = getFirestore();
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

// Webhook secret for signature verification
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook processing error:', errorMessage);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Event handlers
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    // Update user's payment record in Firestore
    if (paymentIntent.metadata?.userId && adminDb) {
      await adminDb
        .collection('payments')
        .add({
          userId: paymentIntent.metadata.userId,
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          timestamp: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling payment succeeded:', errorMessage);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // Log failed payment
    if (paymentIntent.metadata?.userId && adminDb) {
      await adminDb
        .collection('payments')
        .add({
          userId: paymentIntent.metadata.userId,
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'failed',
          error: paymentIntent.last_payment_error?.message,
          timestamp: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling payment failed:', errorMessage);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log(`Charge refunded: ${charge.id}`);
    
    if (adminDb) {
      await adminDb
        .collection('refunds')
        .add({
          stripeChargeId: charge.id,
          stripeRefundId: charge.refunded ? charge.id : null,
          amount: charge.amount_refunded,
          currency: charge.currency,
          timestamp: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling charge refunded:', errorMessage);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription created: ${subscription.id}`);
    
    if (subscription.metadata?.userId && adminDb) {
      const statusMap: Record<Stripe.Subscription.Status, string> = {
        active: 'active',
        past_due: 'past_due',
        unpaid: 'unpaid',
        canceled: 'canceled',
        incomplete: 'incomplete',
        incomplete_expired: 'incomplete_expired',
        trialing: 'trialing',
      };
      
      await adminDb
        .collection('subscriptions')
        .doc(subscription.id)
        .set({
          userId: subscription.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          status: statusMap[subscription.status] || subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          createdAt: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling subscription created:', errorMessage);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription updated: ${subscription.id}`);
    
    if (adminDb) {
      const statusMap: Record<Stripe.Subscription.Status, string> = {
        active: 'active',
        past_due: 'past_due',
        unpaid: 'unpaid',
        canceled: 'canceled',
        incomplete: 'incomplete',
        incomplete_expired: 'incomplete_expired',
        trialing: 'trialing',
      };
      
      await adminDb
        .collection('subscriptions')
        .doc(subscription.id)
        .update({
          status: statusMap[subscription.status] || subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling subscription updated:', errorMessage);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription deleted: ${subscription.id}`);
    
    if (adminDb) {
      await adminDb
        .collection('subscriptions')
        .doc(subscription.id)
        .update({
          status: 'canceled',
          canceledAt: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling subscription deleted:', errorMessage);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice paid: ${invoice.id}`);
    
    if (adminDb) {
      await adminDb
        .collection('invoices')
        .add({
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'paid',
          paidAt: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling invoice payment succeeded:', errorMessage);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`);
    
    if (adminDb) {
      await adminDb
        .collection('invoices')
        .add({
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          failedAt: new Date(),
        });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling invoice payment failed:', errorMessage);
  }
}
