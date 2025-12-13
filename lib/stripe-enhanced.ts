/**
 * 💰 Enhanced Stripe Integration & Billing Management
 * Complete subscription, pricing, and payment management system
 */

import Stripe from 'stripe';
import { getAdminDb } from './firebase-admin';
import { getConfig } from './config';
import { captureError, captureMessage } from './sentry';

let stripeInstance: Stripe | null = null;

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency' | 'enterprise' | 'education';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trialDays?: number;
  features: string[];
  limits: Record<string, number>;
  metadata?: Record<string, string>;
}

export interface BillingInfo {
  customerId: string;
  subscriptionId?: string;
  tier: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  nextBillingDate?: Date;
  paymentMethod?: string;
}

/**
 * Get Stripe instance
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const config = getConfig();
    if (!config.stripe.secret) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripeInstance = new Stripe(config.stripe.secret);
  }
  return stripeInstance;
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const stripe = getStripe();

  try {
    // Check if customer already exists in Firestore
    const db = getAdminDb();
    if (db) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      if (userDoc.exists && userData?.stripeCustomerId) {
        return userData.stripeCustomerId;
      }
    }

    // Search for existing customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      // Save to Firestore
      if (db) {
        await db.collection('users').doc(userId).update({ stripeCustomerId: customerId });
      }
      return customerId;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    // Save to Firestore
    if (db) {
      await db.collection('users').doc(userId).set({ stripeCustomerId: customer.id }, { merge: true });
    }

    captureMessage(`Created Stripe customer for user ${userId}`, 'info');
    return customer.id;
  } catch (error) {
    console.error('Error managing customer:', error);
    captureException(error, { context: 'stripe_customer_error' });
    throw error;
  }
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  tier: string,
  options?: {
    successUrl?: string;
    cancelUrl?: string;
    trialDays?: number;
    coupon?: string;
  }
): Promise<Stripe.Checkout.Session> {
  try {
    const stripe = getStripe();
    const customerId = await getOrCreateCustomer(userId, email);

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: options?.successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: options?.cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/billing/cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
        email,
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
    };

    if (options?.trialDays) {
      sessionData.subscription_data!.trial_period_days = options.trialDays;
    }

    if (options?.coupon) {
      sessionData.discounts = [{ coupon: options.coupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    return session;
  } catch (error) {
    console.error('Checkout session creation error:', error);
    captureException(error, { context: 'stripe_checkout_error' });
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  options: {
    priceId?: string;
    tier?: string;
    trialEndsAt?: number;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();

    const updateData: Stripe.SubscriptionUpdateParams = {
      metadata: {
        tier: options.tier,
      },
    };

    if (options.priceId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0]?.id;

      if (itemId) {
        updateData.items = [
          {
            id: itemId,
            price: options.priceId,
          },
        ];
      }
    }

    if (typeof options.cancelAtPeriodEnd === 'boolean') {
      updateData.cancel_at_period_end = options.cancelAtPeriodEnd;
    }

    const updated = await stripe.subscriptions.update(subscriptionId, updateData);
    return updated;
  } catch (error) {
    console.error('Subscription update error:', error);
    captureException(error, { context: 'stripe_update_error' });
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const stripe = getStripe();

    if (immediate) {
      // Immediate cancellation
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    captureException(error, { context: 'stripe_cancel_error' });
    throw error;
  }
}

/**
 * Get billing portal session
 */
export async function getBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const stripe = getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration: process.env.STRIPE_CUSTOMER_PORTAL_ID,
    });

    return session;
  } catch (error) {
    console.error('Billing portal session error:', error);
    captureException(error, { context: 'stripe_portal_error' });
    throw error;
  }
}

/**
 * Create coupon/discount
 */
export async function createCoupon(
  options: {
    percentOff?: number;
    amountOff?: number;
    currency?: string;
    durationMonths?: number;
    code?: string;
    maxRedemptions?: number;
  }
): Promise<Stripe.Coupon> {
  try {
    const stripe = getStripe();

    const couponData: Stripe.CouponCreateParams = {
      duration: options.durationMonths ? 'repeating' : 'forever',
    };

    if (options.percentOff) {
      couponData.percent_off = options.percentOff;
    } else if (options.amountOff) {
      couponData.amount_off = options.amountOff;
      couponData.currency = options.currency || 'usd';
    }

    if (options.durationMonths) {
      couponData.duration_in_months = options.durationMonths;
    }

    const coupon = await stripe.coupons.create(couponData);
    return coupon;
  } catch (error) {
    console.error('Coupon creation error:', error);
    captureException(error, { context: 'stripe_coupon_error' });
    throw error;
  }
}

/**
 * Get invoice
 */
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
  try {
    const stripe = getStripe();
    return await stripe.invoices.retrieve(invoiceId);
  } catch (error) {
    console.error('Invoice retrieval error:', error);
    return null;
  }
}

/**
 * List invoices for customer
 */
export async function listInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  try {
    const stripe = getStripe();
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  } catch (error) {
    console.error('Invoices list error:', error);
    return [];
  }
}

/**
 * Get customer's billing info
 */
export async function getCustomerBillingInfo(
  customerId: string
): Promise<BillingInfo | null> {
  try {
    const stripe = getStripe();

    // Get customer
    // // const customer removed - unused

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'active',
    });

    const activeSubscription = subscriptions.data[0];

    const billingInfo: BillingInfo = {
      customerId,
      tier: activeSubscription?.metadata?.tier || 'free',
      status: activeSubscription?.status || 'canceled',
    };

    if (activeSubscription) {
      billingInfo.subscriptionId = activeSubscription.id;
      billingInfo.currentPeriodStart = new Date(
        activeSubscription.current_period_start * 1000
      );
      billingInfo.currentPeriodEnd = new Date(
        activeSubscription.current_period_end * 1000
      );
      billingInfo.cancelAtPeriodEnd = activeSubscription.cancel_at_period_end;

      if (activeSubscription.cancel_at) {
        billingInfo.nextBillingDate = new Date(activeSubscription.cancel_at * 1000);
      } else if (activeSubscription.current_period_end) {
        billingInfo.nextBillingDate = new Date(
          activeSubscription.current_period_end * 1000
        );
      }
    }

    return billingInfo;
  } catch (error) {
    console.error('Billing info retrieval error:', error);
    return null;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}

export default {
  getStripe,
  getOrCreateCustomer,
  createCheckoutSession,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getBillingPortalSession,
  createCoupon,
  getInvoice,
  listInvoices,
  getCustomerBillingInfo,
  verifyWebhookSignature,
};




