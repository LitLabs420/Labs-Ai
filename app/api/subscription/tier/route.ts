import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase, getUsageCount } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

// Tier usage limits (per 24 hours)
const TIER_LIMITS = {
  free: { ai_generation: 3, image_generation: 1, social_post: 0, facial_recognition: 0, parental_controls: 0 },
  starter: { ai_generation: 20, image_generation: 5, social_post: 5, facial_recognition: 5, parental_controls: 1 },
  creator: { ai_generation: 100, image_generation: 20, social_post: 30, facial_recognition: 50, parental_controls: 5 },
  pro: { ai_generation: 500, image_generation: 100, social_post: 200, facial_recognition: 500, parental_controls: 50 },
  agency: { ai_generation: 5000, image_generation: 1000, social_post: 2000, facial_recognition: 5000, parental_controls: 500 },
} as const;

/**
 * GET /api/subscription/tier
 * Get current user's tier information
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const tier = (subscription?.tier || auth.tier || "free") as keyof typeof TIER_LIMITS;
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

    return successResponse({
      tier,
      status: subscription?.status || "active",
      limits,
      billingCycleEnd: subscription?.billing_cycle_end,
    });
  } catch (error) {
    captureError("Get tier error", { error });
    return errorResponse(500, "Internal server error");
  }
}

/**
 * POST /api/subscription/check-limits
 * Check if user has reached usage limits for an operation
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { operation } = body;

    if (!operation) {
      return errorResponse(400, "Operation is required");
    }

    // Get user tier
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const tier = (subscription?.tier || auth.tier || "free") as keyof typeof TIER_LIMITS;
    const limits = TIER_LIMITS[tier];
    const limit = limits[operation as keyof typeof limits] || 0;

    // Get current usage count
    const usage = await getUsageCount(auth.userId, operation, 24);

    const allowed = usage < limit;
    const remaining = Math.max(0, limit - usage);

    return successResponse({
      operation,
      tier,
      limit,
      usage,
      remaining,
      allowed,
    });
  } catch (error) {
    captureError("Check limits error", { error });
    return errorResponse(500, "Internal server error");
  }
}
