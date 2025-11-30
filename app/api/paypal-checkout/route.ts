import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API = 'https://api-m.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

async function getPayPalToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const data = (await response.json()) as { access_token?: string };
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { email, amount, currency = 'USD' } = await request.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount required' },
        { status: 400 }
      );
    }

    const token = await getPayPalToken();

    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
          },
        ],
        payer: { email_address: email },
        redirect_urls: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?paypal_success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?paypal_cancel=true`,
        },
      }),
    });

    const orderData = (await orderResponse.json()) as {
      id?: string;
      links?: Array<{ rel: string; href: string }>;
    };
    if (!orderData.id) throw new Error('No order ID returned');

    const approveLink = orderData.links?.find((l) => l.rel === 'approve')?.href;

    return NextResponse.json({
      orderId: orderData.id,
      approveUrl: approveLink,
    });
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
