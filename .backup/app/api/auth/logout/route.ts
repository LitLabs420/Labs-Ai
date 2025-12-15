import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Delete all sessions for this user
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("user_id", auth.userId);

    if (error) {
      captureError("Failed to delete sessions", { error });
      return errorResponse(500, "Failed to logout");
    }

    const response = successResponse({ message: "Logged out successfully" });

    // Clear session cookie
    response.cookies.delete("session");

    return response;
  } catch (error) {
    captureError("Logout error", { error });
    return errorResponse(500, "Internal server error");
  }
}
