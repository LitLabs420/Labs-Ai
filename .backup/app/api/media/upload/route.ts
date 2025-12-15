/**
 * Upload Media (Images, Videos, Audio)
 * POST /api/media/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { mediaUpload } from '@/lib/media-upload';
import { extractAuth } from '@/lib/auth-middleware';
import { rateLimiter } from '@/lib/rate-limiter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `upload:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 5, 60 * 1000); // 5 uploads per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'image' | 'video' | 'audio';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let media;

    switch (type) {
      case 'image':
        media = await mediaUpload.uploadImage(auth.userId, file);
        break;
      case 'video':
        media = await mediaUpload.uploadVideo(auth.userId, file);
        break;
      case 'audio':
        media = await mediaUpload.uploadAudio(auth.userId, file);
        break;
      default:
        return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
