import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

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
    // Save payment record using your database (Vercel KV, PostgreSQL, or MongoDB)
    savePaymentRecord({
      userId: paymentIntent.metadata.userId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'succeeded',
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('Failed to save payment record:', error);
    });
  }
}

function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✗ Payment failed: ${paymentIntent.id}`);
  console.log(`  Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
  console.log(`  Error: ${paymentIntent.last_payment_error?.message}`);
  if (paymentIntent.metadata?.userId) {
    console.log(`  User: ${paymentIntent.metadata.userId}`);
    // Log failed payment and send notification
    logFailedPayment({
      userId: paymentIntent.metadata.userId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      error: paymentIntent.last_payment_error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('Failed to log payment error:', error);
    });
  }
}

function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`↩ Charge refunded: ${charge.id}`);
  console.log(`  Amount refunded: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`);
  // Update refund record in database
  saveRefundRecord({
    chargeId: charge.id,
    amount: charge.amount_refunded / 100,
    currency: charge.currency,
    timestamp: new Date().toISOString()
  }).catch(error => {
    console.error('Failed to save refund record:', error);
  });
}

function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription created: ${subscription.id}`);
  console.log(`  Status: ${subscription.status}`);
  console.log(`  Customer: ${subscription.customer}`);
  if (subscription.metadata?.userId) {
    console.log(`  User: ${subscription.metadata.userId}`);
    // Save subscription to database
    saveSubscription({
      userId: subscription.metadata.userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      currentPeriodEnd: new Date(((subscription as unknown as Record<string, number>).current_period_end || 0) * 1000).toISOString(),
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('Failed to save subscription:', error);
    });
  }
}

function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription updated: ${subscription.id}`);
  console.log(`  New status: ${subscription.status}`);
  // Update subscription in database
  updateSubscription({
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(((subscription as unknown as Record<string, number>).current_period_end || 0) * 1000).toISOString()
  }).catch(error => {
    console.error('Failed to update subscription:', error);
  });
}

function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`📅 Subscription deleted: ${subscription.id}`);
  if (subscription.canceled_at) {
    console.log(`  Canceled at: ${new Date(subscription.canceled_at * 1000).toISOString()}`);
  }
  // Mark subscription as canceled in database
  cancelSubscription({
    subscriptionId: subscription.id,
    canceledAt: new Date(subscription.canceled_at ? subscription.canceled_at * 1000 : Date.now()).toISOString()
  }).catch(error => {
    console.error('Failed to cancel subscription:', error);
  });
}

function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice paid: ${invoice.id}`);
  console.log(`  Amount paid: ${invoice.amount_paid / 100} ${invoice.currency?.toUpperCase()}`);
  console.log(`  Customer: ${invoice.customer}`);
  // Update invoice record in database
  saveInvoice({
    invoiceId: invoice.id,
    customerId: invoice.customer as string,
    amountPaid: invoice.amount_paid / 100,
    currency: invoice.currency || 'usd',
    status: 'paid',
    timestamp: new Date().toISOString()
  }).catch(error => {
    console.error('Failed to save invoice:', error);
  });
}

function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice payment failed: ${invoice.id}`);
  console.log(`  Amount due: ${invoice.amount_due / 100} ${invoice.currency?.toUpperCase()}`);
  // Log failed invoice and notify customer
  logFailedInvoice({
    invoiceId: invoice.id,
    customerId: invoice.customer as string,
    amountDue: invoice.amount_due / 100,
    currency: invoice.currency || 'usd',
    timestamp: new Date().toISOString()
  }).catch(error => {
    console.error('Failed to log invoice error:', error);
  });
}

/**
 * DATABASE HANDLERS - Supabase (PostgreSQL)
 * 
 * Tables are created and managed in Supabase dashboard
 * See lib/supabase.ts for SQL schema
 */

async function savePaymentRecord(data: {
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('payments').insert({
      stripe_payment_id: data.paymentId,
      user_id: data.userId,
      amount: Math.round(data.amount * 100), // Store as cents
      currency: data.currency.toUpperCase(),
      status: data.status,
      metadata: { timestamp: data.timestamp }
    });

    if (error) {
      console.error('Supabase error saving payment:', error);
      throw error;
    }
    console.log(`✓ Payment record saved to Supabase: ${data.paymentId}`);
  } catch (error: unknown) {
    console.error('Failed to save payment record:', error instanceof Error ? error.message : String(error));
  }
}

async function logFailedPayment(data: {
  userId: string;
  paymentId: string;
  amount: number;
  error: string;
  timestamp: string;
}): Promise<void> {
  try {
    const { error: supabaseError } = await supabase.from('payment_failures').insert({
      stripe_payment_id: data.paymentId,
      user_id: data.userId,
      error_message: data.error,
      metadata: { amount: data.amount, timestamp: data.timestamp }
    });

    if (supabaseError) {
      console.error('Supabase error logging failed payment:', supabaseError);
      throw supabaseError;
    }
    console.log(`✓ Failed payment logged to Supabase: ${data.paymentId}`);
    // TODO: Send email notification to user about failed payment
  } catch (error: unknown) {
    console.error('Failed to log payment error:', error instanceof Error ? error.message : String(error));
  }
}

async function saveRefundRecord(data: {
  chargeId: string;
  amount: number;
  currency: string;
  timestamp: string;
}): Promise<void> {
  try {
    // First, find the payment by charge ID to link refund
    const { data: paymentData } = await supabase
      .from('payments')
      .select('id, user_id')
      .eq('stripe_payment_id', data.chargeId)
      .single();

    const { error } = await supabase.from('refunds').insert({
      stripe_refund_id: `refund_${data.chargeId}_${Date.now()}`,
      payment_id: paymentData?.id,
      user_id: paymentData?.user_id || 'unknown',
      amount: Math.round(data.amount * 100),
      reason: 'stripe_refund',
      status: 'completed',
      metadata: { currency: data.currency, timestamp: data.timestamp }
    });

    if (error) {
      console.error('Supabase error saving refund:', error);
      throw error;
    }
    console.log(`✓ Refund record saved to Supabase: ${data.chargeId}`);
  } catch (error: unknown) {
    console.error('Failed to save refund record:', error instanceof Error ? error.message : String(error));
  }
}

async function saveSubscription(data: {
  userId: string;
  subscriptionId: string;
  customerId: string;
  status: string;
  currentPeriodEnd: string;
  timestamp: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('subscriptions').insert({
      stripe_subscription_id: data.subscriptionId,
      user_id: data.userId,
      stripe_customer_id: data.customerId,
      status: data.status,
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(new Date(data.currentPeriodEnd).getTime() / 1000),
      cancel_at_period_end: false,
      metadata: { timestamp: data.timestamp }
    });

    if (error) {
      console.error('Supabase error saving subscription:', error);
      throw error;
    }
    console.log(`✓ Subscription saved to Supabase: ${data.subscriptionId}`);
  } catch (error: unknown) {
    console.error('Failed to save subscription:', error instanceof Error ? error.message : String(error));
  }
}

async function updateSubscription(data: {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: data.status,
        current_period_end: Math.floor(new Date(data.currentPeriodEnd).getTime() / 1000),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', data.subscriptionId);

    if (error) {
      console.error('Supabase error updating subscription:', error);
      throw error;
    }
    console.log(`✓ Subscription updated in Supabase: ${data.subscriptionId}`);
  } catch (error: unknown) {
    console.error('Failed to update subscription:', error instanceof Error ? error.message : String(error));
  }
}

async function cancelSubscription(data: {
  subscriptionId: string;
  canceledAt: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', data.subscriptionId);

    if (error) {
      console.error('Supabase error canceling subscription:', error);
      throw error;
    }
    console.log(`✓ Subscription canceled in Supabase: ${data.subscriptionId}`);
    // TODO: Send cancellation email to user
  } catch (error: unknown) {
    console.error('Failed to cancel subscription:', error instanceof Error ? error.message : String(error));
  }
}

async function saveInvoice(data: {
  invoiceId: string;
  customerId: string;
  amountPaid: number;
  currency: string;
  status: string;
  timestamp: string;
}): Promise<void> {
  try {
    // Find subscription for this customer
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('stripe_customer_id', data.customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase.from('invoices').insert({
      stripe_invoice_id: data.invoiceId,
      subscription_id: subscriptionData?.id,
      user_id: subscriptionData?.user_id || 'unknown',
      amount: Math.round(data.amountPaid * 100),
      status: data.status,
      paid: data.status === 'paid',
      metadata: { currency: data.currency, timestamp: data.timestamp }
    });

    if (error) {
      console.error('Supabase error saving invoice:', error);
      throw error;
    }
    console.log(`✓ Invoice saved to Supabase: ${data.invoiceId}`);
  } catch (error: unknown) {
    console.error('Failed to save invoice:', error instanceof Error ? error.message : String(error));
  }
}

async function logFailedInvoice(data: {
  invoiceId: string;
  customerId: string;
  amountDue: number;
  currency: string;
  timestamp: string;
}): Promise<void> {
  try {
    // Find subscription for this customer
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('stripe_customer_id', data.customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase.from('invoices').insert({
      stripe_invoice_id: data.invoiceId,
      subscription_id: subscriptionData?.id,
      user_id: subscriptionData?.user_id || 'unknown',
      amount: Math.round(data.amountDue * 100),
      status: 'failed',
      paid: false,
      metadata: { currency: data.currency, timestamp: data.timestamp }
    });

    if (error) {
      console.error('Supabase error logging failed invoice:', error);
      throw error;
    }
    console.log(`✓ Failed invoice logged to Supabase: ${data.invoiceId}`);
    // TODO: Send notification to customer about failed payment
  } catch (error: unknown) {
    console.error('Failed to log invoice error:', error instanceof Error ? error.message : String(error));
  }
}

