import { NextRequest, NextResponse } from 'next/server';
import { vercelService } from '@/lib/vercel-service';

/**
 * POST /api/vercel/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      framework,
      buildCommand,
      devCommand,
      installCommand,
      outputDirectory,
      rootDirectory,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const result = await vercelService.createProject({
      name,
      framework,
      buildCommand,
      devCommand,
      installCommand,
      outputDirectory,
      rootDirectory,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: result.project,
    });
  } catch (error) {
    console.error('Create project API error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vercel/projects?id=projectId
 * Get project details or list all projects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (projectId) {
      // Get specific project
      const result = await vercelService.getProject(projectId);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        project: result.project,
      });
    } else {
      // List all projects
      const result = await vercelService.listProjects(limit);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        projects: result.projects,
        pagination: result.pagination,
      });
    }
  } catch (error) {
    console.error('Get projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vercel/projects?id=projectId
 * Update project settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await vercelService.updateProject(projectId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: result.project,
    });
  } catch (error) {
    console.error('Update project API error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
