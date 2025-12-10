import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.userId)
      .single();

    if (error) {
      captureError("Failed to fetch profile", { error, userId: auth.userId });
      return errorResponse(500, "Failed to fetch profile");
    }

    if (!profile) {
      return errorResponse(404, "Profile not found");
    }

    return successResponse(profile);
  } catch (error) {
    captureError("Get profile error", { error });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/user/profile
 * Update the current user's profile
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();

    // Only allow updating these fields
    const allowedUpdates = [
      "display_name",
      "bio",
      "avatar_url",
      "theme_id",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedUpdates) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", auth.userId)
      .select()
      .single();

    if (error) {
      captureError("Failed to update profile", { error, userId: auth.userId });
      return errorResponse(500, "Failed to update profile");
    }

    return successResponse(profile);
  } catch (error) {
    captureError("Update profile error", { error });
    return errorResponse(500, "Internal server error");
  }
}
