/**
 * Send Tip to Creator
 * POST /api/marketplace/tip
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';
import { extractAuth } from '@/lib/auth-middleware';
import { rateLimiter } from '@/lib/rate-limiter';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TipSchema = z.object({
  recipient_id: z.string().uuid(),
  amount: z.number().min(100), // Minimum $1 tip
  message: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `tip:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 10, 60 * 1000); // 10 tips per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many tips sent. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = TipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    await marketplace.sendTip(
      auth.userId,
      data.recipient_id,
      data.amount,
      data.message
    );

    return NextResponse.json({
      success: true,
      message: 'Tip sent successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send tip';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
