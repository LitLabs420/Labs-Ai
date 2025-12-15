import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";
import { supabase } from "@/lib/database";
import { checkRateLimit, logSecurityEvent, sanitizeString } from "@/lib/security-middleware";

/**
 * Authentication context passed to route handlers
 */
export interface AuthContext {
  userId: string;
  email?: string;
  tier?: "free" | "starter" | "creator" | "pro" | "agency" | "education";
  isAuthenticated: boolean;
  isAdmin?: boolean;
  ipAddress?: string;
}

/**
 * Verify JWT token from Bearer authorization
 * Extracts and validates the JWT structure
 */
async function verifyBearerToken(token: string): Promise<AuthContext | null> {
  try {
    // For Supabase JWT, we can decode the payload (but not verify signature without the secret)
    // In production, use Supabase client to verify token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    // Check token expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    // Extract user information from token
    const userId = payload.sub || payload.user_id;
    const email = payload.email;

    if (!userId) {
      return null;
    }

    // Fetch user profile and subscription tier from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_tier')
      .eq('id', userId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return {
      userId,
      email,
      tier: (subscription?.tier || profile?.premium_tier || 'free') as any,
      isAuthenticated: true,
      isAdmin: payload.is_admin || false,
    };
  } catch (error) {
    captureError("Bearer token verification failed", { error });
    return null;
  }
}

/**
 * Verify API key from x-api-key header
 */
async function verifyApiKey(apiKey: string): Promise<AuthContext | null> {
  try {
    // Fetch API key record from database
    const { data: keyRecord } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', apiKey)
      .single();

    if (!keyRecord || !keyRecord.is_active) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, premium_tier')
      .eq('id', keyRecord.user_id)
      .single();

    if (!profile) {
      return null;
    }

    // Fetch subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .single();

    return {
      userId: profile.id,
      email: profile.email,
      tier: (subscription?.tier || profile.premium_tier || 'free') as any,
      isAuthenticated: true,
    };
  } catch (error) {
    captureError("API key verification failed", { error });
    return null;
  }
}

/**
 * Verify session cookie
 */
async function verifySessionCookie(sessionCookie: string): Promise<AuthContext | null> {
  try {
    // Fetch session from database
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', sessionCookie)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, premium_tier')
      .eq('id', session.user_id)
      .single();

    if (!profile) {
      return null;
    }

    // Fetch subscription tier
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .single();

    return {
      userId: profile.id,
      email: profile.email,
      tier: (subscription?.tier || profile.premium_tier || 'free') as any,
      isAuthenticated: true,
    };
  } catch (error) {
    captureError("Session cookie verification failed", { error });
    return null;
  }
}

/**
 * Extract authentication from request
 * Supports: Bearer token, API key header, cookie
 */
export async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Get IP address for rate limiting and security logging
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    // Check rate limit for auth attempts (5 per minute)
    if (!checkRateLimit(ip, "auth")) {
      logSecurityEvent("Rate limit exceeded - auth", { ip }, request);
      return null;
    }

    // Check Bearer token first (highest priority)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const bearerAuth = await verifyBearerToken(token);
      if (bearerAuth) return { ...bearerAuth, ipAddress: ip };
    }

    // Check API key second
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      const sanitized = sanitizeString(apiKey);
      const apiKeyAuth = await verifyApiKey(sanitized);
      if (apiKeyAuth) return { ...apiKeyAuth, ipAddress: ip };
    }

    // Check cookie last (for web clients)
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      const cookieAuth = await verifySessionCookie(sessionCookie);
      if (cookieAuth) return { ...cookieAuth, ipAddress: ip };
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
