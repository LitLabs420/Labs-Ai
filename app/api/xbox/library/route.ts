import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getXboxCloudLibrary, getEmulatorLibrary } from '@/lib/xbox-gaming';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get library type from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'cloud'; // 'cloud' or 'emulator' or 'all'

    let library = [];

    if (type === 'cloud' || type === 'all') {
      const cloudGames = await getXboxCloudLibrary();
      library.push(...cloudGames);
    }

    if (type === 'emulator' || type === 'all') {
      const emulatorGames = getEmulatorLibrary();
      library.push(...emulatorGames);
    }

    return NextResponse.json({
      success: true,
      data: library,
      count: library.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch game library';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
