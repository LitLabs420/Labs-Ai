/**
 * Task status and history endpoints
 * GET /api/tasks/[taskId] - Get task status
 * GET /api/tasks - Get user's task history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getTaskStatus, getUserTasks } from '@/lib/task-manager';
import { captureError } from '@/lib/sentry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks - Get user's task history
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const taskId = url.searchParams.get('taskId');

    // If taskId provided, get specific task
    if (taskId) {
      const task = await getTaskStatus(taskId);

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Verify ownership
      if (task.userId !== user.uid) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        task,
      });
    }

    // Get task history
    const tasks = await getUserTasks(
      user.uid,
      status as any,
      limit
    );

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Task retrieval error:', error);
    captureException(error, { context: 'task_retrieval_error' });

    return NextResponse.json(
      {
        error: 'Failed to retrieve tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
