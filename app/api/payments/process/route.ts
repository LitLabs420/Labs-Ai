/**
 * Payment Processing API
 * Unified endpoint for all payment methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { payments, PaymentRequest } from '@/lib/payments';
import { extractAuth } from '@/lib/auth-middleware';
import { captureError } from '@/lib/sentry';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema
const PaymentSchema = z.object({
  amount: z.number().positive().min(100), // Minimum $1.00
  currency: z.string().optional().default('USD'),
  method: z.enum([
    'stripe',
    'paypal',
    'venmo',
    'cashapp',
    'zelle',
    'apple_pay',
    'google_pay',
    'crypto_solana',
    'crypto_ethereum',
    'crypto_coinbase',
    'klarna',
    'affirm',
    'alipay',
    'wechat',
    'ideal',
    'sepa',
    'uk_bank',
    'ach',
    'wire',
  ]),
  tier: z.string().optional(),
  description: z.string(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  billingAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string(),
    })
    .optional(),
  savePaymentMethod: z.boolean().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * POST /api/payments/process
 * Process a payment with any supported method
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = PaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build payment request
    const paymentRequest: PaymentRequest = {
      userId: auth.userId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      tier: data.tier,
      description: data.description,
      customerEmail: data.customerEmail || auth.email,
      customerName: data.customerName,
      billingAddress: data.billingAddress,
      savePaymentMethod: data.savePaymentMethod,
      metadata: {
        ...data.metadata,
        user_tier: auth.tier || 'free',
        timestamp: new Date().toISOString(),
      },
    };

    // Process payment
    const result = await payments.processPayment(paymentRequest);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Payment processing failed',
          paymentId: result.paymentId,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      clientSecret: result.clientSecret,
      redirectUrl: result.redirectUrl,
      requiresAction: result.requiresAction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment processing failed';
    await captureError('Payment API error', { error: message });
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/methods
 * Get available payment methods for user's location
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';

    const availableMethods = payments.getAvailablePaymentMethods(country);

    return NextResponse.json({
      country,
      methods: availableMethods,
      recommended: getRecommendedMethod(country),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch payment methods';
    await captureError('Payment methods API error', { error: message });
    return NextResponse.json(
      { error: 'Internal server error', message },
      { status: 500 }
    );
  }
}

/**
 * Get recommended payment method based on country
 */
function getRecommendedMethod(country: string): string {
  const recommendations: Record<string, string> = {
    US: 'stripe',
    GB: 'stripe',
    CA: 'stripe',
    AU: 'stripe',
    NL: 'ideal',
    DE: 'sepa',
    FR: 'sepa',
    CN: 'alipay',
    JP: 'stripe',
    KR: 'stripe',
  };

  return recommendations[country] || 'stripe';
}
