/**
 * Monetization Dashboard API
 * Complete view of earnings, subscriptions, affiliates, add-ons
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/firebase-server';
import { captureError } from '@/lib/sentry';
import {
  getUserSubscription,
  getTierDetails,
  getTeamMembers,
} from '@/lib/subscription-manager';
import {
  getWhiteLabelConfig,
} from '@/lib/white-label';
import {
  getRevenueMetricsRange,
} from '@/lib/advanced-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/monetization/dashboard
 * Complete monetization overview
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription info
    const subscription = await getUserSubscription(user.uid);
    const tier = subscription ? getTierDetails(subscription.tier) : getTierDetails('free');

    // Get team info
    const teamMembers = await getTeamMembers(user.uid);
    const activeMembers = teamMembers.filter((m: any) => m.isActive).length;

    // Get white-label config
    const whiteLabelConfig = await getWhiteLabelConfig(user.uid);

    // Get revenue metrics for current month
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 7);

    const revenueData = await getRevenueMetricsRange(
      user.uid,
      lastMonth,
      currentMonth
    );
    const currentMonthRevenue = revenueData.find(r => r.month === currentMonth);
    const lastMonthRevenue = revenueData.find(r => r.month === lastMonth);

    const mrrGrowth =
      lastMonthRevenue && currentMonthRevenue
        ? (
            ((currentMonthRevenue.mrr - lastMonthRevenue.mrr) /
              Math.max(1, lastMonthRevenue.mrr)) *
            100
          ).toFixed(1)
        : '0';

    return NextResponse.json({
      success: true,
      dashboard: {
        subscriptionStatus: {
          tier: tier.name,
          description: tier.description,
          price: tier.price > 0 ? `$${tier.price}/month` : 'Free',
          users: `${activeMembers}/${tier.users}`,
          storage: `${subscription?.storageUsed || 0}GB / ${tier.storage}GB`,
          nextBillingDate: subscription?.nextBillingDate?.toISOString(),
          autoRenew: subscription?.autoRenew ?? true,
          status: subscription?.status || 'inactive',
        },
        team: {
          totalMembers: activeMembers,
          maxMembers: tier.users,
          members: teamMembers
            .filter(m => m.isActive)
            .map(m => ({
              name: m.name || m.email,
              email: m.email,
              role: m.role,
              joinedAt: m.joinedAt.toISOString(),
            })),
        },
        affiliate: affiliateProfile
          ? {
              status: 'active',
              referralCode: affiliateProfile.referralCode,
              referralLink: affiliateProfile.referralLink,
              tier: affiliateProfile.tier,
              commissionRate: `${(affiliateProfile.commissionRate * 100).toFixed(0)}%`,
              totalEarnings: `$${affiliateProfile.totalEarnings.toFixed(2)}`,
              monthlyEarnings: `$${affiliateProfile.monthlyEarnings.toFixed(2)}`,
              totalReferrals: affiliateStats?.totalReferrals || 0,
              activeReferrals: affiliateStats?.activeReferrals || 0,
              conversionRate: `${(affiliateStats?.conversionRate || 0).toFixed(1)}%`,
            }
          : {
              status: 'inactive',
              message: 'Not enrolled in affiliate program',
            },
        whiteLabelFeatures: whiteLabelConfig
          ? {
              status: 'active',
              companyName: whiteLabelConfig.companyName,
              customDomain: whiteLabelConfig.customDomain,
              primaryColor: whiteLabelConfig.primaryColor,
              features: Object.entries(whiteLabelConfig.features)
                .filter(([, enabled]) => enabled)
                .map(([feature]) => feature),
            }
          : {
              status: 'inactive',
              message: 'White-label features not configured',
            },
        revenue: {
          currentMonthMRR: `$${(currentMonthRevenue?.mrr || 0).toFixed(2)}`,
          lastMonthMRR: `$${(lastMonthRevenue?.mrr || 0).toFixed(2)}`,
          growth: `${mrrGrowth}%`,
          totalRevenue: `$${(currentMonthRevenue?.totalRevenue || 0).toFixed(2)}`,
          subscriptionRevenue: `$${(
            currentMonthRevenue?.subscriptionRevenue || 0
          ).toFixed(2)}`,
          affiliateRevenue: `$${(currentMonthRevenue?.affiliateRevenue || 0).toFixed(2)}`,
          addonRevenue: `$${(currentMonthRevenue?.addonRevenue || 0).toFixed(2)}`,
          churnRate: `${(currentMonthRevenue?.churnRate || 0).toFixed(1)}%`,
        },
        features: {
          customization: {
            whiteLabel: tier.features.includes('Custom integrations'),
            customDomain: whiteLabelConfig?.customDomain !== undefined,
            teamCollaboration: tier.users > 1,
            advancedReporting: tier.features.includes('Advanced reporting'),
            apiAccess: tier.features.includes('API access'),
          },
          limits: {
            aiGenerations: tier.limits.aiGenerations === -1 ? 'Unlimited' : tier.limits.aiGenerations,
            dmReplies: tier.limits.dmReplies === -1 ? 'Unlimited' : tier.limits.dmReplies,
            moneyPlays: tier.limits.moneyPlays === -1 ? 'Unlimited' : tier.limits.moneyPlays,
            imageGenerations: tier.limits.imageGenerations === -1 ? 'Unlimited' : tier.limits.imageGenerations,
            videoGenerations: tier.limits.videoGenerations === -1 ? 'Unlimited' : tier.limits.videoGenerations,
          },
        },
      },
    });
  } catch (error) {
    captureError(error, { context: 'api/monetization/dashboard' });
    return NextResponse.json(
      { error: 'Failed to fetch monetization dashboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monetization/upgrade
 * Upgrade subscription tier
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetTier } = body;

    if (!targetTier) {
      return NextResponse.json({ error: 'Target tier is required' }, { status: 400 });
    }

    // TODO: Create Stripe checkout session for upgrade
    // This would integrate with the Stripe billing module

    return NextResponse.json({
      success: true,
      message: `Upgrade to ${targetTier} initiated`,
      checkoutUrl: `/checkout?tier=${targetTier}`,
    });
  } catch (error) {
    captureError(error, { context: 'api/monetization/upgrade' });
    return NextResponse.json(
      { error: 'Failed to initiate upgrade' },
      { status: 500 }
    );
  }
}
