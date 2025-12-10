import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { deleteFace } from "@/lib/face-recognition";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * DELETE /api/security/face/[id]
 * Delete a face profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const faceId = id;

    if (!faceId) {
      return errorResponse(400, "Face ID is required");
    }

    const success = await deleteFace(auth.userId, faceId);

    if (!success) {
      return errorResponse(500, "Failed to delete face profile");
    }

    return successResponse({ deleted: true });
  } catch (error) {
    captureError("Delete face error", { error });
    return errorResponse(500, "Internal server error");
  }
}
