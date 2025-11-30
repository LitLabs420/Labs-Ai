import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-11-17.clover',
    });

    const { email, priceId, successUrl, cancelUrl } = await request.json();

    if (!email || !priceId) {
      return NextResponse.json(
        { error: 'Email and priceId required' },
        { status: 400 }
      );
    }

    // Create or get customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
