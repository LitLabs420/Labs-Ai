import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * Authentication context passed to route handlers
 */
export interface AuthContext {
  userId: string;
  email?: string;
  tier?: "free" | "starter" | "creator" | "pro" | "agency" | "education";
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

/**
 * Extract authentication from request
 * Supports: Bearer token, API key header, cookie
 */
export async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Check Bearer token
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      // const token = authHeader.slice(7);
      // TODO: Verify token with Firebase or your auth provider
      // const user = await verifyToken(token);
      // return { userId: user.uid, email: user.email, isAuthenticated: true };
    }

    // Check API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      // TODO: Verify API key
      // const user = await verifyApiKey(apiKey);
      // return { userId: user.uid, isAuthenticated: true };
    }

    // Check cookie (for web clients)
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      // TODO: Verify session cookie
      // const user = await verifySession(sessionCookie);
      // return { userId: user.uid, isAuthenticated: true };
    }

    return null;
  } catch (error) {
    captureError("Auth extraction failed", { error });
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const auth = await extractAuth(request);
  
  if (!auth?.isAuthenticated) {
    return errorResponse(401, "Unauthorized", "Authentication required");
  }
  
  return auth;
}

/**
 * Require specific tier middleware
 */
export async function requireTier(
  request: NextRequest,
  requiredTiers: string[]
) {
  const auth = await requireAuth(request);
  
  if (auth instanceof Response) {
    // Error response from requireAuth
    return auth;
  }

  if (!auth.tier || !requiredTiers.includes(auth.tier)) {
    return errorResponse(
      403,
      "Forbidden",
      `This feature requires one of: ${requiredTiers.join(", ")}`
    );
  }
  
  return auth;
}

/**
 * Require admin privileges
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (auth instanceof Response) {
    return auth;
  }

  if (!auth.isAdmin) {
    return errorResponse(403, "Forbidden", "Admin privileges required");
  }
  
  return auth;
}

/**
 * Optional authentication - doesn't fail if not authenticated
 */
export async function optionalAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await extractAuth(request);
  
  return (
    auth || {
      userId: "anonymous",
      isAuthenticated: false,
    }
  );
}

export default {
  extractAuth,
  requireAuth,
  requireTier,
  requireAdmin,
  optionalAuth,
};
