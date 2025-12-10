/**
 * Get Creator Earnings Dashboard
 * GET /api/marketplace/earnings
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';
import { extractAuth } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const earnings = await marketplace.getCreatorEarnings(auth.userId);

    return NextResponse.json({
      success: true,
      earnings: {
        available_balance: earnings.balance,
        total_earned: earnings.totalEarned,
        breakdown: earnings.breakdown,
        recent_transactions: earnings.recent,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get earnings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
