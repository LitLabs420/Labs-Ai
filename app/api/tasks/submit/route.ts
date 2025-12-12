/**
 * Task submission API endpoint
 * POST /api/tasks/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { submitTask } from '@/lib/task-manager';
import { Consumer } from '@/lib/nats-consumer';
import { canPerformActionServer, incrementUsageServer } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';
import { captureError } from '@/lib/sentry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request
    const body = await request.json();
    const { type, payload, priority } = body;

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: type, payload' },
        { status: 400 }
      );
    }

    // Validate task type
    const validTaskTypes = [
      'ai_generation',
      'dm_reply',
      'money_play',
      'image_generation',
      'video_generation',
      'email_sequence',
      'automation',
      'report_generation',
    ];

    if (!validTaskTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid task type: ${type}` },
        { status: 400 }
      );
    }

    // 3. Get user tier and check limits
    const userDoc = await require('@/lib/firebase-server').getUserDocument(user.uid);
    const tier = userDoc?.tier || 'free';

    const check = await canPerformActionServer(user.uid, type);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason },
        { status: 403 }
      );
    }

    // 4. Security analysis
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(user.uid, type, {
      ip,
      payload: JSON.stringify(payload).substring(0, 100),
    });

    if (!securityCheck.safe) {
      captureError(
        new Error(`Security check failed for user ${user.uid}`),
        'security_check_failed'
      );
      return NextResponse.json(
        { error: 'Security check failed', reason: securityCheck.reason },
        { status: 403 }
      );
    }

    // 5. Submit task
    const task = await submitTask({
      type: type as any,
      userId: user.uid,
      tier: tier as any,
      payload,
      priority: priority || 'medium',
      metadata: {
        source: 'api',
        tags: ['user-submitted'],
      },
    });

    // 6. Publish to NATS for processing
    try {
      await Consumer.publishTask(task.id, type, user.uid, payload);
    } catch (error) {
      console.warn('NATS publishing failed (will process locally):', error);
    }

    // 7. Increment usage
    await incrementUsageServer(user.uid, type);

    return NextResponse.json(
      {
        success: true,
        taskId: task.id,
        status: task.status,
        message: 'Task submitted successfully',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Task submission error:', error);
    captureError(error, 'task_submission_api_error');

    return NextResponse.json(
      {
        error: 'Failed to submit task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

