/**
 * Premium Monetization API Routes
 * 
 * Handles:
 * - Premium tier checkout
 * - Upsell management
 * - Crypto payment processing
 * - Revenue tracking
 * - Dynamic pricing application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import Stripe from 'stripe';
import {
  PREMIUM_TIERS,
  UPSELL_PACKAGES,
  getCompatibleUpsells,
  TierName,
} from '@/lib/premium-pricing';
import {
  calculateChurnRiskScore,
  calculateEngagementScore,
  getMonetizationRecommendations,
  UserMonetizationProfile,
} from '@/lib/revenue-maximization';
import {
  CRYPTO_PAYMENT_CONFIG,
  convertUsdToCrypto,
  convertCryptoToUsd,
  validateWalletAddress,
} from '@/lib/crypto-marketplace';
import { Guardian } from '@/lib/guardian-bot';
import { getAdminDb } from '@/lib/firebase-admin';
import { incrementUsageServer, canPerformActionServer } from '@/lib/firebase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * POST /api/premium/checkout
 * Create Stripe checkout session for premium tier
 */
export async function POST_checkout(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tierName, billingCycle = 'monthly', upsellIds = [], couponCode } = body;

    // Validate tier
    const tier = PREMIUM_TIERS[tierName as TierName];
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get price ID
    const priceId = billingCycle === 'monthly'
      ? tier.stripePriceIdMonthly
      : tier.stripePriceIdAnnual;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Tier not configured in Stripe' },
        { status: 500 }
      );
    }

    // Calculate upsell items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: priceId, quantity: 1 },
    ];

    // Add selected upsells
    for (const upsellId of upsellIds) {
      const upsell = UPSELL_PACKAGES.find(u => u.id === upsellId);
      if (upsell && tier.position >= 1) { // Only allow upsells for non-free tiers
        // You would need to create Stripe products for each upsell
        // For now, adding placeholder
        lineItems.push({
          price: `price_${upsellId}`, // Would be real Stripe price ID
          quantity: 1,
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: lineItems,
      mode: 'subscription',
      billing_address_collection: 'required',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=true`,
      metadata: {
        userId: user.uid,
        tier: tierName,
        billingCycle,
        upsells: upsellIds.join(','),
      },
      automatic_tax: { enabled: true },
      coupon: couponCode,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/premium/crypto-checkout
 * Initiate crypto payment (returns wallet address to send to)
 */
export async function POST_cryptoCheckout(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tierName, cryptoAsset, walletAddress } = body;

    // Validate inputs
    if (!PREMIUM_TIERS[tierName as TierName]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    if (!CRYPTO_PAYMENT_CONFIG[cryptoAsset]) {
      return NextResponse.json({ error: 'Unsupported crypto asset' }, { status: 400 });
    }

    // Validate wallet address format
    if (!validateWalletAddress(walletAddress, cryptoAsset)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const tier = PREMIUM_TIERS[tierName as TierName];
    const usdAmount = tier.monthlyPrice; // Could also be annual
    const cryptoAmount = convertUsdToCrypto(usdAmount, cryptoAsset);

    // Create payment record in Firestore
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const paymentRef = await db.collection('crypto_payments').add({
      userId: user.uid,
      tier: tierName,
      cryptoAsset,
      amount: cryptoAmount,
      usdValue: usdAmount,
      fromAddress: walletAddress,
      toAddress: process.env[`CRYPTO_WALLET_${cryptoAsset}`] || '', // Platform wallet
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        userEmail: user.email,
        clientIp: request.headers.get('x-forwarded-for'),
      },
    });

    // Return payment details
    return NextResponse.json({
      paymentId: paymentRef.id,
      toAddress: process.env[`CRYPTO_WALLET_${cryptoAsset}`],
      amount: cryptoAmount,
      asset: cryptoAsset,
      usdValue: usdAmount,
      confirmationsRequired: CRYPTO_PAYMENT_CONFIG[cryptoAsset].confirmations,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
    });
  } catch (error: unknown) {
    console.error('Crypto checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Crypto checkout failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/premium/recommendations
 * Get personalized upgrade/upsell recommendations for current user
 */
export async function GET_recommendations(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Fetch user profile
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Build monetization profile
    const profile: Partial<UserMonetizationProfile> = {
      userId: user.uid,
      currentTier: userData?.tier || 'free',
      monthlySpend: userData?.subscription?.price || 0,
      usageMetrics: userData?.usage || {},
      purchaseHistory: userData?.purchaseHistory || {},
      churnIndicators: {
        lastActiveDate: userData?.lastActive,
        daysInactive: Math.floor(
          (Date.now() - (userData?.lastActive?.getTime?.() || Date.now())) / (1000 * 60 * 60 * 24)
        ),
        failedPayments: userData?.failedPayments || 0,
        supportTickets: userData?.supportTickets || 0,
        negativeReviews: userData?.negativeReviews || 0,
        refundRequests: userData?.refundRequests || 0,
      },
    };

    // Calculate scores
    profile.churnRiskScore = calculateChurnRiskScore(profile);
    profile.engagementScore = calculateEngagementScore(profile);

    // Get recommendations
    const recommendations = getMonetizationRecommendations(profile as UserMonetizationProfile);

    // Get compatible upsells for current tier
    const compatibleUpsells = getCompatibleUpsells(profile.currentTier as TierName);

    return NextResponse.json({
      profile,
      recommendations,
      compatibleUpsells,
      nextTierInfo: recommendations.tier
        ? PREMIUM_TIERS[recommendations.tier]
        : null,
    });
  } catch (error: unknown) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/premium/apply-coupon
 * Validate and apply promotional coupon
 */
export async function POST_applyCoupon(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { couponCode } = body;

    // Retrieve coupon from Stripe
    const coupon = await stripe.coupons.retrieve(couponCode);

    if (!coupon.valid) {
      return NextResponse.json({ error: 'Coupon expired or invalid' }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.id,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      currency: coupon.currency,
      duration: coupon.duration,
      redeemBy: coupon.redeem_by,
    });
  } catch (error: unknown) {
    console.error('Coupon error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid coupon' },
      { status: 400 }
    );
  }
}

/**
 * POST /api/premium/add-upsell
 * Add upsell package to existing subscription
 */
export async function POST_addUpsell(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { upsellId } = body;

    // Validate upsell exists
    const upsell = UPSELL_PACKAGES.find(u => u.id === upsellId);
    if (!upsell) {
      return NextResponse.json({ error: 'Invalid upsell' }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user's current subscription
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Add item to subscription
    const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);

    await stripe.subscriptionItems.create({
      subscription: subscription.id,
      price: `price_${upsellId}`, // Would be real Stripe price ID
      metadata: { upsellId },
    });

    // Update Firestore
    await userDoc.ref.update({
      activeUpsells: [...(userData.activeUpsells || []), upsellId],
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `${upsell.name} added to your subscription`,
      newPrice: (userData.subscription?.price || 0) + upsell.monthlyPrice,
    });
  } catch (error: unknown) {
    console.error('Upsell error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add upsell' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/premium/upsell/:upsellId
 * Remove upsell from subscription
 */
export async function DELETE_removeUpsell(request: NextRequest, { params }: any) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { upsellId } = params;

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user's subscription
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    // Find and remove subscription item
    const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
    const itemToRemove = subscription.items.data.find(
      item => (item.metadata as any)?.upsellId === upsellId
    );

    if (itemToRemove) {
      await stripe.subscriptionItems.del(itemToRemove.id);
    }

    // Update Firestore
    const updatedUpsells = (userData.activeUpsells || []).filter((id: string) => id !== upsellId);
    await userDoc.ref.update({
      activeUpsells: updatedUpsells,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Remove upsell error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove upsell' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/premium/pricing-info
 * Get all pricing information for frontend
 */
export async function GET_pricingInfo(request: NextRequest) {
  return NextResponse.json({
    tiers: PREMIUM_TIERS,
    upsells: UPSELL_PACKAGES,
    cryptoAssets: CRYPTO_PAYMENT_CONFIG,
    features: {
      // Map feature keys to user-friendly descriptions
      'ai.generations.monthly': 'AI Generations per Month',
      'content.storage.gb': 'Storage (GB)',
      'content.collaborators': 'Team Members',
      'api.access': 'API Access',
      'whitelabel.enabled': 'White Label',
    },
  });
}
