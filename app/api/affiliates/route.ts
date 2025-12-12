/**
 * Affiliate Management API
 * Create affiliate profile, track referrals, manage payouts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';
import { captureError } from '@/lib/sentry';
import {
  createAffiliateProfile,
  getAffiliateProfile,
  getAffiliateReferrals,
  getAffiliateStats,
  trackReferral,
} from '@/lib/affiliate-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/affiliates/register
 * Create affiliate profile
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payoutMethod, stripeConnectId, paypalEmail } = body;

    if (!payoutMethod) {
      return NextResponse.json({ error: 'Payout method is required' }, { status: 400 });
    }

    // Check if already an affiliate
    const existing = await getAffiliateProfile(user.uid);
    if (existing) {
      return NextResponse.json(
        { error: 'You are already registered as an affiliate' },
        { status: 409 }
      );
    }

    // Security check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const guardian = Guardian.getInstance();
    await guardian.analyzeUserBehavior(user.uid, 'affiliate_register', {
      ip,
      payoutMethod,
    });

    // Build payout details
    const payoutDetails: any = {};
    if (payoutMethod === 'stripe' && stripeConnectId) {
      payoutDetails.stripeConnectId = stripeConnectId;
    } else if (payoutMethod === 'paypal' && paypalEmail) {
      payoutDetails.paypalEmail = paypalEmail;
    }

    // Create profile
    const profile = await createAffiliateProfile(user.uid, payoutMethod, payoutDetails);

    return NextResponse.json(
      {
        success: true,
        profile: {
          referralCode: profile.referralCode,
          referralLink: profile.referralLink,
          commissionRate: `${(profile.commissionRate * 100).toFixed(0)}%`,
          tier: profile.tier,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    captureError(error, { context: 'api/affiliates/register' });
    return NextResponse.json(
      { error: 'Failed to create affiliate profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/affiliates/profile
 * Get affiliate profile and stats
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getAffiliateProfile(user.uid);
    if (!profile) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 });
    }

    const stats = await getAffiliateStats(user.uid);
    const referrals = await getAffiliateReferrals(user.uid);

    return NextResponse.json({
      success: true,
      profile: {
        referralCode: profile.referralCode,
        referralLink: profile.referralLink,
        commissionRate: `${(profile.commissionRate * 100).toFixed(0)}%`,
        tier: profile.tier,
        totalEarnings: profile.totalEarnings.toFixed(2),
        monthlyEarnings: profile.monthlyEarnings.toFixed(2),
        website: profile.website,
        bio: profile.bio,
      },
      stats: {
        totalReferrals: stats.totalReferrals,
        activeReferrals: stats.activeReferrals,
        totalCommissions: stats.totalCommissions.toFixed(2),
        monthlyCommissions: stats.monthlyCommissions.toFixed(2),
        conversionRate: `${stats.conversionRate.toFixed(1)}%`,
        averageCommissionValue: stats.averageCommissionValue.toFixed(2),
      },
      recentReferrals: referrals.slice(0, 10).map(r => ({
        id: r.id,
        status: r.status,
        tier: r.referredTier,
        commission: r.commission.toFixed(2),
        referredAt: r.referredAt.toISOString(),
      })),
    });
  } catch (error) {
    captureError(error, { context: 'api/affiliates/profile' });
    return NextResponse.json(
      { error: 'Failed to fetch affiliate profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/affiliates/referrals
 * List affiliate referrals
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const referrals = await getAffiliateReferrals(user.uid, status || undefined);

    return NextResponse.json({
      success: true,
      total: referrals.length,
      referrals: referrals.map(r => ({
        id: r.id,
        status: r.status,
        tier: r.referredTier,
        commission: r.commission.toFixed(2),
        subscriptionValue: r.subscriptionValue.toFixed(2),
        referredAt: r.referredAt.toISOString(),
        qualifiedAt: r.qualifiedAt?.toISOString(),
        paidAt: r.paidAt?.toISOString(),
      })),
    });
  } catch (error) {
    captureError(error, { context: 'api/affiliates/referrals' });
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/affiliates/referral/track
 * Track new referral
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliateCode, userId, tier } = body;

    if (!affiliateCode || !userId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Track referral
    const referral = await trackReferral(userId, affiliateCode, tier);

    return NextResponse.json({
      success: true,
      referralId: referral.id,
    });
  } catch (error) {
    captureError(error, { context: 'api/affiliates/referral/track' });
    return NextResponse.json(
      { error: 'Failed to track referral' },
      { status: 500 }
    );
  }
}
