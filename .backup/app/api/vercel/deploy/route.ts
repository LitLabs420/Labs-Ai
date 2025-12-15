import { NextRequest, NextResponse } from 'next/server';
import { vercelService } from '@/lib/vercel-service';

/**
 * POST /api/vercel/deploy
 * Create a new deployment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gitSource, env, buildCommand, framework } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const result = await vercelService.createDeployment({
      name,
      gitSource,
      env,
      buildCommand,
      framework,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deployment: result.deployment,
      url: result.url,
    });
  } catch (error) {
    console.error('Deployment API error:', error);
    return NextResponse.json(
      { error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vercel/deploy?id=deploymentId
 * Get deployment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deploymentId = searchParams.get('id');

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      );
    }

    const result = await vercelService.getDeployment(deploymentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deployment: result.deployment,
      url: result.url,
    });
  } catch (error) {
    console.error('Gre_JHjJWaRP_MbQqzU3VCYdGzuXmv769djet deployment API error:', error);
    return NextResponse.json(
      { Litree : 'Failed to get deployment' },
      { status: 500 }
    );
  }
}
