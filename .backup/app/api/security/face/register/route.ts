import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { registerFace, logFaceAuth } from "@/lib/face-recognition";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * POST /api/security/face/register
 * Register a new face for biometric authentication
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const label = (formData.get("label") as string) || "primary";

    if (!imageFile) {
      return errorResponse(400, "Image file is required");
    }

    // Convert image to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Register face
    const result = await registerFace(auth.userId, buffer, label);

    if (!result) {
      return errorResponse(500, "Failed to register face");
    }

    // Log successful registration
    await logFaceAuth(auth.userId, true, result.confidence, {
      action: "register",
      label,
    });

    return successResponse(result, "Face registered successfully", 201);
  } catch (error) {
    captureError("Register face error", { error });
    return errorResponse(500, "Internal server error");
  }
}
