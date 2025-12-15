import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * GET /api/social/connections
 * Get user's social connections (followers/following)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Get followers
    const { data: followers, error: followersError } = await supabase
      .from("social_connections")
      .select("*, follower:follower_id(id, display_name, avatar_url)")
      .eq("following_id", auth.userId)
      .eq("status", "accepted");

    // Get following
    const { data: following, error: followingError } = await supabase
      .from("social_connections")
      .select("*, following:following_id(id, display_name, avatar_url)")
      .eq("follower_id", auth.userId)
      .eq("status", "accepted");

    if (followersError || followingError) {
      throw followersError || followingError;
    }

    return successResponse({
      followers: followers || [],
      following: following || [],
      followerCount: (followers || []).length,
      followingCount: (following || []).length,
    });
  } catch (error) {
    captureError("Get connections error", { error });
    return errorResponse(500, "Failed to fetch connections");
  }
}

/**
 * POST /api/social/connections
 * Follow/connect with another user
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { targetUserId, message } = body;

    if (!targetUserId) {
      return errorResponse(400, "Target user ID is required");
    }

    if (targetUserId === auth.userId) {
      return errorResponse(400, "Cannot follow yourself");
    }

    // Check if connection already exists
    const { data: existing } = await supabase
      .from("social_connections")
      .select("id, status")
      .eq("follower_id", auth.userId)
      .eq("following_id", targetUserId)
      .maybeSingle();

    if (existing) {
      return errorResponse(409, `Already ${existing.status} this user`);
    }

    // Create connection request
    const { data: connection, error } = await supabase
      .from("social_connections")
      .insert({
        follower_id: auth.userId,
        following_id: targetUserId,
        status: "pending",
        message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      captureError("Failed to create connection", { error });
      return errorResponse(500, "Failed to create connection");
    }

    return successResponse(connection, "Connection created successfully", 201);
  } catch (error) {
    captureError("POST connections error", { error });
    return errorResponse(500, "Internal server error");
  }
}
