import { NextRequest, NextResponse } from 'next/server';
import { vercelService } from '@/lib/vercel-service';

/**
 * POST /api/vercel/env
 * Create or update an environment variable
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, key, value, target } = body;

    if (!projectId || !key || !value) {
      return NextResponse.json(
        { error: 'Project ID, key, and value are required' },
        { status: 400 }
      );
    }

    const result = await vercelService.setEnvironmentVariable(
      projectId,
      key,
      value,
      target || 'production'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      envVar: result.envVar,
    });
  } catch (error) {
    console.error('Set environment variable API error:', error);
    return NextResponse.json(
      { error: 'Failed to set environment variable' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vercel/env?projectId=xxx
 * Get environment variables for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await vercelService.getEnvironmentVariables(projectId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      envVars: result.envVars,
    });
  } catch (error) {
    console.error('Get environment variables API error:', error);
    return NextResponse.json(
      { error: 'Failed to get environment variables' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vercel/env?projectId=xxx&envId=xxx
 * Delete an environment variable
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const envId = searchParams.get('envId');

    if (!projectId || !envId) {
      return NextResponse.json(
        { error: 'Project ID and environment variable ID are required' },
        { status: 400 }
      );
    }

    const result = await vercelService.deleteEnvironmentVariable(projectId, envId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Environment variable deleted successfully',
    });
  } catch (error) {
    console.error('Delete environment variable API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete environment variable' },
      { status: 500 }
    );
  }
}
