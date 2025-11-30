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

// Default export for backwards compatibility
export { stripe as default };
