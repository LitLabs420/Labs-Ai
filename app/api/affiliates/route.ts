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
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/affiliates/register or POST /api/affiliates/referral/track
 * Create affiliate profile or track a new referral
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutMethod, stripeConnectId, paypalEmail, affiliateCode, userId, tier } = body;

    // Route 1: Register as affiliate
    if (payoutMethod) {
      const user = await getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

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
    }

    // Route 2: Track referral (no auth required)
    if (!affiliateCode || !userId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: affiliateCode, userId, tier' },
        { status: 400 }
      );
    }

    // Find affiliate by referral code
    const q = query(
      collection(db!, 'affiliates'),
      where('referralCode', '==', affiliateCode)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid affiliate code' },
        { status: 404 }
      );
    }

    const affiliateDoc = snapshot.docs[0];
    const affiliateUserId = affiliateDoc.data().userId;

    // Track referral
    const referral = await trackReferral(affiliateUserId, userId, affiliateCode, tier);

    return NextResponse.json({
      success: true,
      referralId: referral.id,
    });
  } catch (error) {
    captureError(error, { context: 'api/affiliates' });
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/affiliates/profile
 * Get affiliate profile, stats, or referrals based on query params
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'profile'; // profile, stats, referrals
    const status = searchParams.get('status');

    const profile = await getAffiliateProfile(user.uid);
    if (!profile) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 404 });
    }

    // Return referrals list if requested
    if (view === 'referrals') {
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
    }

    // Default: return profile with stats and recent referrals
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




