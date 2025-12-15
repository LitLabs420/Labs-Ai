import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import {
  enableParentalControls,
  getParentalControls,
  updateParentalControls,
} from "@/lib/parental-controls";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * GET /api/security/parental-controls
 * Get parental control settings
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const controls = await getParentalControls(auth.userId);

    return successResponse(
      controls || {
        message: "Parental controls not enabled",
      }
    );
  } catch (error) {
    captureError("Get parental controls error", { error });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/security/parental-controls
 * Enable or update parental controls
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();

    // Check if controls already exist
    const existing = await getParentalControls(auth.userId);

    let result;
    if (existing) {
      result = await updateParentalControls(auth.userId, body);
    } else {
      result = await enableParentalControls(auth.userId, body);
    }

    if (!result) {
      return errorResponse(500, "Failed to save parental controls");
    }

    return successResponse(result, "Parental controls updated successfully", 201);
  } catch (error) {
    captureError("Enable parental controls error", { error });
    return errorResponse(500, "Internal server error");
  }
}
