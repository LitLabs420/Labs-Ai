import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, createStripeCustomer, STRIPE_PRODUCTS } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, tier, successUrl, cancelUrl } = await req.json();

    if (!userId || !email || !tier) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = STRIPE_PRODUCTS[tier as keyof typeof STRIPE_PRODUCTS];
    if (!product) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId: string;

    try {
      const customer = await createStripeCustomer(email, email.split("@")[0]);
      stripeCustomerId = customer.id;

      // Store in Firestore
      const dbRef = getAdminDb();
      if (!dbRef) {
        throw new Error("Firestore Admin not initialized");
      }
      await dbRef.collection("users").doc(userId).update({
        stripeCustomerId,
      });
    } catch (err) {
      console.error("Error creating Stripe customer:", err);
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      );
    }

    // Create checkout session
    const trialDays = tier === "pro" ? 14 : undefined;
    const session = await createCheckoutSession(
      stripeCustomerId,
      product.priceId,
      successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=true`,
      trialDays
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
