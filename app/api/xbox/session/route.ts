import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { startXboxCloudSession, startEmulatorGame } from '@/lib/xbox-gaming';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const startSessionSchema = z.object({
  gameId: z.string().min(1),
  type: z.enum(['cloud', 'emulator']),
  emulator: z.string().optional(),
  resolution: z.enum(['hd', '4k', 'ultra']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = startSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      );
    }

    const { gameId, type, emulator, resolution } = validation.data;

    let session;

    if (type === 'cloud') {
      session = await startXboxCloudSession(gameId, resolution);
    } else if (type === 'emulator' && emulator) {
      session = await startEmulatorGame(gameId, emulator);
    } else {
      return NextResponse.json(
        { error: 'Invalid session type or emulator' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
