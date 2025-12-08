import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import {
  getDefaultLayout,
  getUserLayouts,
  saveLayout,
  deleteLayout,
  setDefaultLayout,
  updateWidgetPosition,
  toggleWidget,
  createDefaultLayout,
} from '@/lib/layout-manager';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const saveLayoutSchema = z.object({
  name: z.string().min(1).max(100),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    config: z.record(z.any()).optional(),
    enabled: z.boolean(),
    order: z.number(),
  })),
});

const updatePositionSchema = z.object({
  layoutId: z.string(),
  widgetId: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

const toggleSchema = z.object({
  layoutId: z.string(),
  widgetId: z.string(),
  enabled: z.boolean(),
});

/**
 * GET /api/layouts - Get user's layouts
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layouts = await getUserLayouts(user.uid);
    if (layouts.length === 0) {
      // Create default layout
      const defaultLayout = createDefaultLayout(user.uid);
      await saveLayout(defaultLayout);
      return NextResponse.json([defaultLayout]);
    }

    return NextResponse.json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/layouts - Save new layout
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = saveLayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid layout data', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const layoutId = await saveLayout({
      userId: user.uid,
      name: validation.data.name,
      widgets: validation.data.widgets,
      isDefault: false,
    });

    return NextResponse.json({
      id: layoutId,
      message: 'Layout saved successfully',
    });
  } catch (error) {
    console.error('Error saving layout:', error);
    return NextResponse.json(
      { error: 'Failed to save layout' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/layouts/[action] - Update layout position or toggle widget
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action');

    if (action === 'position') {
      const validation = updatePositionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid data', issues: validation.error.issues },
          { status: 400 }
        );
      }

      await updateWidgetPosition(
        validation.data.layoutId,
        validation.data.widgetId,
        validation.data.position
      );

      return NextResponse.json({ message: 'Position updated' });
    }

    if (action === 'toggle') {
      const validation = toggleSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid data', issues: validation.error.issues },
          { status: 400 }
        );
      }

      await toggleWidget(
        validation.data.layoutId,
        validation.data.widgetId,
        validation.data.enabled
      );

      return NextResponse.json({ message: 'Widget toggled' });
    }

    if (action === 'set-default') {
      const { layoutId } = body;
      if (!layoutId) {
        return NextResponse.json(
          { error: 'layoutId required' },
          { status: 400 }
        );
      }

      await setDefaultLayout(user.uid, layoutId);
      return NextResponse.json({ message: 'Default layout updated' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating layout:', error);
    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/layouts/[layoutId] - Delete layout
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layoutId = request.nextUrl.searchParams.get('id');
    if (!layoutId) {
      return NextResponse.json(
        { error: 'layoutId required' },
        { status: 400 }
      );
    }

    await deleteLayout(layoutId);
    return NextResponse.json({ message: 'Layout deleted' });
  } catch (error) {
    console.error('Error deleting layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    );
  }
}
