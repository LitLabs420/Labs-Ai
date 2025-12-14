/**
 * Request Creator Payout
 * POST /api/marketplace/payout
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';
import { extractAuth } from '@/lib/auth-middleware';
import { rateLimiter } from '@/lib/rate-limiter';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PayoutSchema = z.object({
  amount: z.number().min(2500), // Minimum $25
  method: z.enum(['bank', 'paypal', 'crypto']),
});

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `payout:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 5, 60 * 1000); // 5 payout requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many payout requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = PayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    await marketplace.requestPayout(auth.userId, data.amount, data.method);

    return NextResponse.json({
      success: true,
      message: `Payout request submitted. Funds will arrive in 2-5 business days.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payout request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
