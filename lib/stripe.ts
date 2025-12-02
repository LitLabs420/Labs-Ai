// lib/stripe.ts
import Stripe from "stripe";

let stripe: Stripe;

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    });
  }
  return stripe;
}

export const STRIPE_PRODUCTS = {
  starter: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
    name: "Starter",
    price: 0,
    features: ["AI content gen", "Basic DM replies", "1 playbook"],
  },
  pro: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
    name: "Godmode Pro",
    price: 49,
    trialDays: 14,
    features: [
      "Everything in Starter",
      "Unlimited playbooks",
      "Advanced money plays",
      "30-day Future Builder",
      "Priority support",
    ],
  },
  enterprise: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
    name: "Enterprise",
    price: 299,
    features: [
      "Everything in Pro",
      "White-label solution",
      "API access",
      "Dedicated manager",
    ],
  },
};

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  trialDays?: number
) {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: trialDays
      ? {
          trial_period_days: trialDays,
        }
      : undefined,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}

export async function createStripeCustomer(email: string, name?: string) {
  return getStripe().customers.create({
    email,
    name,
  });
}

// Default export for backwards compatibility
export { getStripe as default };
