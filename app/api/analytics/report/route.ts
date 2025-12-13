/**
 * Advanced Analytics API Endpoint
 * User insights, content performance, revenue tracking, reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { captureError } from '@/lib/sentry';
import {
  getUserInsightsRange,
  getTopPerformingContent,
  getRevenueMetricsRange,
  getUserCohortAnalysis,
  generateComprehensiveReport,
} from '@/lib/advanced-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/insights
 * Get user insights for date range
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('reportType') || 'insights';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (reportType === 'comprehensive') {
      const report = await generateComprehensiveReport(user.uid, start, end);
      return NextResponse.json({
        success: true,
        report,
      });
    }

    if (reportType === 'revenue') {
      const startMonth = start.toISOString().slice(0, 7);
      const endMonth = end.toISOString().slice(0, 7);
      const revenueData = await getRevenueMetricsRange(user.uid, startMonth, endMonth);

      return NextResponse.json({
        success: true,
        revenue: revenueData,
        totalRevenue: revenueData.reduce((sum, r) => sum + r.totalRevenue, 0),
        avgMRR: revenueData.reduce((sum, r) => sum + r.mrr, 0) / revenueData.length,
      });
    }

    if (reportType === 'content') {
      const topContent = await getTopPerformingContent(user.uid, 'engagement', 20);
      return NextResponse.json({
        success: true,
        topContent: topContent.map(c => ({
          id: c.contentId,
          title: c.title,
          type: c.contentType,
          views: c.views,
          shares: c.shares,
          engagement: `${c.engagement.toFixed(1)}%`,
          sentiment: c.sentiment,
          createdAt: c.createdAt.toISOString(),
        })),
      });
    }

    // Default: insights
    const insights = await getUserInsightsRange(user.uid, start, end);

    const summary = {
      totalGenerations: insights.reduce((sum, i) => sum + i.generationsCount, 0),
      totalDMReplies: insights.reduce((sum, i) => sum + i.dmRepliesCount, 0),
      totalMoneyPlays: insights.reduce((sum, i) => sum + i.moneyPlaysCount, 0),
      totalImages: insights.reduce((sum, i) => sum + i.imageGenerationsCount, 0),
      totalVideos: insights.reduce((sum, i) => sum + i.videoGenerationsCount, 0),
      totalTokensUsed: insights.reduce((sum, i) => sum + i.totalTokensUsed, 0),
      avgResponseTime: Math.round(
        insights.reduce((sum, i) => sum + i.averageResponseTime, 0) / insights.length || 0
      ),
      errorRate: (
        insights.reduce((sum, i) => sum + i.errorRate, 0) / insights.length || 0
      ).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      summary,
      dailyData: insights,
    });
  } catch (error) {
    captureError(error, { context: 'api/analytics/insights' });
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/cohort
 * Get cohort analysis
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { joinDateStart, joinDateEnd } = body;

    if (!joinDateStart || !joinDateEnd) {
      return NextResponse.json(
        { error: 'joinDateStart and joinDateEnd are required' },
        { status: 400 }
      );
    }

    const cohortAnalysis = await getUserCohortAnalysis(
      new Date(joinDateStart),
      new Date(joinDateEnd)
    );

    return NextResponse.json({
      success: true,
      cohortAnalysis: {
        cohortSize: cohortAnalysis.cohortSize,
        activeUsers: cohortAnalysis.activeUsers,
        retentionRate: `${cohortAnalysis.retentionRate.toFixed(1)}%`,
        avgRevenuePerUser: `$${cohortAnalysis.avgRevenuePerUser.toFixed(2)}`,
        estimatedLTV: `$${cohortAnalysis.avgLTVEstimate.toFixed(2)}`,
      },
    });
  } catch (error) {
    captureError(error, { context: 'api/analytics/cohort' });
    return NextResponse.json(
      { error: 'Failed to fetch cohort analysis' },
      { status: 500 }
    );
  }
}
