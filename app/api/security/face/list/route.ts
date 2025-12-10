import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { listFaces } from "@/lib/face-recognition";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * GET /api/security/face/list
 * List all registered faces for user
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const faces = await listFaces(auth.userId);

    return successResponse({
      faces,
      count: faces.length,
    });
  } catch (error) {
    captureError("List faces error", { error });
    return errorResponse(500, "Internal server error");
  }
}
