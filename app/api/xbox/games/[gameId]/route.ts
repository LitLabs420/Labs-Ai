import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getGameAchievements, getGameStats } from '@/lib/xbox-gaming';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') || 'all'; // 'achievements', 'stats', 'all'

    const response: Record<string, any> = { success: true };

    if (dataType === 'achievements' || dataType === 'all') {
      response.achievements = getGameAchievements(gameId);
    }

    if (dataType === 'stats' || dataType === 'all') {
      response.stats = getGameStats(gameId);
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch game data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
