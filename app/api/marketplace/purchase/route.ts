/**
 * Purchase Marketplace Item
 * POST /api/marketplace/purchase
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';
import { extractAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PurchaseSchema = z.object({
  item_id: z.string().uuid(),
  amount: z.number().positive(), // cents
  payment_method: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = PurchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Process purchase with revenue split
    const purchase = await marketplace.processPurchase(
      auth.userId,
      data.item_id,
      data.amount,
      data.payment_method
    );

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase successful! Creator has been credited.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Purchase failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
