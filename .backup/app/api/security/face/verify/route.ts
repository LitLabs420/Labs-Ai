import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { verifyFace, logFaceAuth } from "@/lib/face-recognition";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * POST /api/security/face/verify
 * Verify user identity via face recognition
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const requiredConfidence = parseFloat(
      (formData.get("confidence") as string) || "0.85"
    );

    if (!imageFile) {
      return errorResponse(400, "Image file is required");
    }

    // Convert image to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Verify face
    const result = await verifyFace(auth.userId, buffer, requiredConfidence);

    // Log authentication attempt
    await logFaceAuth(auth.userId, result.verified, result.confidence, {
      action: "verify",
    });

    if (!result.verified) {
      return errorResponse(401, "Face verification failed", `Confidence: ${result.confidence.toFixed(2)}`);
    }

    return successResponse({
      verified: true,
      confidence: result.confidence,
    });
  } catch (error) {
    captureError("Verify face error", { error });
    return errorResponse(500, "Internal server error");
  }
}
