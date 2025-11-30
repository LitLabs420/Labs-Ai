import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
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
    const txnRef = collection(db, 'transactions');
    await addDoc(txnRef, {
      userId,
      email,
      tier,
      amount,
      paymentMethod,
      transactionId,
      status: status || 'completed',
      createdAt: serverTimestamp(),
      type: 'subscription_upgrade',
    });

    // Log activity
    const activityRef = collection(db, 'activity_log');
    await addDoc(activityRef, {
      userId,
      action: `upgraded_to_${tier}`,
      details: { paymentMethod, amount },
      timestamp: serverTimestamp(),
    });

    console.log(`✅ Subscription updated: ${email} → ${tier}`);

    return NextResponse.json(
      {
        success: true,
        message: `Subscription updated to ${tier}`,
        user: { userId, email, tier },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription manager error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
