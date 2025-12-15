import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";
import { rateLimiter } from "@/lib/rate-limiter";

/**
 * GET /api/social/feed
 * Get personalized feed from followed users
 */
export async function GET(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `social-feed:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 30, 60 * 1000); // 30 feed requests per minute

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many feed requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const limit = 20;
    const offset = Number(request.nextUrl.searchParams.get("offset") || 0);

    // Get users that this user follows
    const { data: following } = await supabase
      .from("social_connections")
      .select("following_id")
      .eq("follower_id", auth.userId)
      .eq("status", "accepted");

    const followingIds = [auth.userId, ...(following?.map((f) => f.following_id) || [])];

    // Get posts from followed users
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        `*,
        author:user_id(id, display_name, avatar_url),
        likes:post_likes(count),
        comments:post_comments(count)`
      )
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      captureError("Failed to fetch feed", { error: postsError });
      return errorResponse(500, "Failed to fetch feed");
    }

    return successResponse({
      posts: posts || [],
      hasMore: (posts || []).length === limit,
      offset: offset + limit,
    });
  } catch (error) {
    captureError("GET feed error", { error });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/social/feed
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { content, mediaUrls, visibility } = body;

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return errorResponse(400, "Post must have content or media");
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: auth.userId,
        content: content || "",
        media_urls: mediaUrls || [],
        visibility: visibility || "public",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      captureError("Failed to create post", { error });
      return errorResponse(500, "Failed to create post");
    }

    return successResponse(post, "Post created successfully", 201);
  } catch (error) {
    captureError("POST feed error", { error });
    return errorResponse(500, "Internal server error");
  }
}
