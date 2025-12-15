import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";

/**
 * GET /api/user/subscription
 * Get the current user's subscription and tier information
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== "PGRST116") {
      captureError("Failed to fetch subscription", { error: subError });
      return errorResponse(500, "Failed to fetch subscription");
    }

    // Get profile for fallback tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("premium_tier")
      .eq("id", auth.userId)
      .single();

    const tier = subscription?.tier || profile?.premium_tier || "free";
    const status = subscription?.status || "active";
    const billingCycleEnd = subscription?.billing_cycle_end || null;

    return successResponse({
      tier,
      status,
      billingCycleEnd,
      subscription: subscription || null,
    });
  } catch (error) {
    captureError("Get subscription error", { error });
    return errorResponse(500, "Internal server error");
  }
}
