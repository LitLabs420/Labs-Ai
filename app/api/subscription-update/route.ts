import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { info, error } from '@/lib/serverLogger';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SUBSCRIPTION MANAGER - WEBHOOK ONLY
 * Handles payment confirmations and subscription updates
 * Called ONLY by verified webhook processors when payments complete
 * 
 * SECURITY: This endpoint should ONLY be called by webhooks (Stripe, PayPal)
 * Direct client calls are FORBIDDEN to prevent unauthorized tier upgrades
 */

const subscriptionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  tier: z.enum(['free', 'starter', 'creator', 'pro', 'enterprise', 'agency', 'education']),
  paymentMethod: z.enum(['stripe', 'paypal']),
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  status: z.string().default('completed'),
  webhookSource: z.enum(['stripe', 'paypal']).optional(), // Verified webhook source
});

export async function POST(request: NextRequest) {
  try {
    // Verify this request comes from a webhook (internal call only)
    // Check for internal webhook secret header
    const webhookSecret = request.headers.get('x-internal-webhook-secret');
    const expectedSecret = process.env.INTERNAL_WEBHOOK_SECRET;
    
    if (!expectedSecret || webhookSecret !== expectedSecret) {
      error('❌ Unauthorized subscription-update attempt - webhook verification failed');
      return NextResponse.json(
        { error: 'Forbidden - This endpoint is for internal webhook use only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = subscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { userId, email, tier, paymentMethod, transactionId, amount, status } = validation.data;

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
