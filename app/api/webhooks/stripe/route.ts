import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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
        handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'customer.subscription.created':
        handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
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
function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✓ Payment succeeded: ${paymentIntent.id}`);
  console.log(`  Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
  if (paymentIntent.metadata?.userId) {
    console.log(`  User: ${paymentIntent.metadata.userId}`);
  }
  // TODO: Update user's payment record in your database
}

function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✗ Payment failed: ${paymentIntent.id}`);
  console.log(`  Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
  console.log(`  Error: ${paymentIntent.last_payment_error?.message}`);
  if (paymentIntent.metadata?.userId) {
    console.log(`  User: ${paymentIntent.metadata.userId}`);
  }
  // TODO: Log failed payment and notify user
}

function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`↩ Charge refunded: ${charge.id}`);
  console.log(`  Amount refunded: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`);
  // TODO: Update refund record in your database
}

function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription created: ${subscription.id}`);
  console.log(`  Status: ${subscription.status}`);
  console.log(`  Customer: ${subscription.customer}`);
  if (subscription.metadata?.userId) {
    console.log(`  User: ${subscription.metadata.userId}`);
  }
  // TODO: Save subscription details to your database
}

function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription updated: ${subscription.id}`);
  console.log(`  New status: ${subscription.status}`);
  // TODO: Update subscription record in your database
}

function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription deleted: ${subscription.id}`);
  if (subscription.canceled_at) {
    console.log(`  Canceled at: ${new Date(subscription.canceled_at * 1000).toISOString()}`);
  }
  // TODO: Mark subscription as canceled in your database
}

function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice paid: ${invoice.id}`);
  console.log(`  Amount paid: ${invoice.amount_paid / 100} ${invoice.currency?.toUpperCase()}`);
  console.log(`  Customer: ${invoice.customer}`);
  // TODO: Update invoice record in your database
}

function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice payment failed: ${invoice.id}`);
  console.log(`  Amount due: ${invoice.amount_due / 100} ${invoice.currency?.toUpperCase()}`);
  // TODO: Log failed invoice and notify customer
}
