// API endpoint for Google Cloud analytics
// GET /api/analytics/bigquery

import { NextResponse } from 'next/server';
import gcp from '@/lib/google-cloud-integration';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days')) || 7;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let data = {};

    switch (metric) {
      case 'revenue':
        data = await gcp.getRevenueMetrics(userId);
        break;
      case 'automations':
        data = await gcp.getAutomationMetrics(userId);
        break;
      case 'activity':
        data = await gcp.getUserActivity(userId, days);
        break;
      case 'top-automations':
        data = await gcp.getTopAutomations(10);
        break;
      default:
        // Return all metrics
        data = {
          revenue: await gcp.getRevenueMetrics(userId),
          automations: await gcp.getAutomationMetrics(userId),
          activity: await gcp.getUserActivity(userId, days)
        };
    }

    return NextResponse.json({
      success: true,
      metric: metric || 'all',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId, eventType, eventData, automationType, trigger, action: automationAction } = body;

    switch (action) {
      case 'log-event':
        await gcp.logEvent(userId, eventType, eventData);
        break;

      case 'log-automation':
        await gcp.logAutomation(userId, automationType, trigger, automationAction, 'success');
        break;

      case 'log-metrics':
        await gcp.logBotMetrics(userId, body.metrics);
        break;

      case 'sync-stripe':
        const syncResult = await gcp.syncStripePayment(body.stripeEvent);
        return NextResponse.json({ success: syncResult });

      case 'backup':
        const backupFile = await gcp.backupFirestoreData(body.collection, body.data);
        return NextResponse.json({ success: true, backupFile });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics POST error:', error);
    await gcp.logError('Analytics API Error', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
