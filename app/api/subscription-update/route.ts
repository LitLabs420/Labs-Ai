import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { info, error } from '@/lib/serverLogger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SUBSCRIPTION MANAGER
 * Handles payment confirmations and subscription updates
 * Called by webhook processors when payments complete
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, tier, paymentMethod, transactionId, amount, status } = body;

    if (!userId || !email || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update user tier
    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    await dbRef
      .collection('users')
      .doc(userId)
      .update({
        tier,
        subscription: {
          plan: tier,
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: true,
        },
        lastUpgradeDate: new Date().toISOString(),
      });

    // Record transaction
    await dbRef.collection('transactions').add({
      userId,
      email,
      tier,
      amount,
      paymentMethod,
      transactionId,
      status: status || 'completed',
      createdAt: new Date(),
      type: 'subscription_upgrade',
    });

    // Log activity
    await dbRef.collection('activity_log').add({
      userId,
      action: `upgraded_to_${tier}`,
      details: { paymentMethod, amount },
      timestamp: new Date(),
    });

    info(`✅ Subscription updated: ${email} → ${tier}`);

    return NextResponse.json(
      {
        success: true,
        message: `Subscription updated to ${tier}`,
        user: { userId, email, tier },
      },
      { status: 200 }
    );
  } catch (err) {
    error('Subscription manager error:', err);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
