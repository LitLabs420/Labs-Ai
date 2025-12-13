/**
 * Task submission API endpoint
 * POST /api/tasks/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { submitTask } from '@/lib/task-manager';
import { canPerformActionServer, incrementUsageServer, getUserDocument } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';
import { captureError } from '@/lib/sentry';
import type { TaskType, UserTier } from '@/types';

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
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { type, payload, priority } = body as Record<string, unknown>;

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: type, payload' },
        { status: 400 }
      );
    }

    // Validate task type
    const validTaskTypes: TaskType[] = [
      'ai_generation',
      'dm_reply',
      'money_play',
      'image_generation',
      'video_generation',
      'email_sequence',
      'automation',
      'report_generation',
    ];

    if (!validTaskTypes.includes(type as TaskType)) {
      return NextResponse.json(
        { error: 'Invalid task type provided' },
        { status: 400 }
      );
    }

    // 3. Get user tier and check limits
    const userDoc = await getUserDocument(user.uid);
    const tier = (userDoc?.tier || 'free') as UserTier;

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
        { context: 'security_check_failed' }
      );
      return NextResponse.json(
        { error: 'Security check failed', reason: securityCheck.threat?.details || 'Unknown threat' },
        { status: 403 }
      );
    }

    // 5. Submit task
    const task = await submitTask({
      type: type as TaskType,
      userId: user.uid,
      tier: tier,
      payload,
      priority: priority || 'medium',
      metadata: {
        source: 'api',
        tags: ['user-submitted'],
      },
    });

    // 6. Publish to NATS for processing (disabled - NATS is optional)
    // Tasks will be processed locally via task-manager

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
    captureError(error, { context: 'task_submission_api_error' });

    // Don't expose internal error details in production
    return NextResponse.json(
      {
        error: 'Failed to submit task',
      },
      { status: 500 }
    );
  }
}