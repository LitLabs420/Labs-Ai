import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";
import { rateLimiter } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";

interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  username?: string;
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST before any processing
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `register:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 5, 60 * 1000); // 5 attempts per 60 seconds

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body: RegisterRequest = await request.json();
    const { email, password, displayName, username } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse(400, "Email and password are required");
    }

    if (password.length < 8) {
      return errorResponse(400, "Password must be at least 8 characters");
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return errorResponse(409, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user profile
    const userId = crypto.randomUUID();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email.toLowerCase(),
        username: username || email.split("@")[0],
        display_name: displayName || email.split("@")[0],
        password_hash: hashedPassword,
        premium_tier: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      captureError("Failed to create user profile", { error: profileError });
      return errorResponse(500, "Failed to create user account");
    }

    // Create default subscription
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        tier: "free",
        status: "active",
        billing_cycle_start: new Date().toISOString(),
        billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subError) {
      captureError("Failed to create subscription", { error: subError });
      return errorResponse(500, "Failed to create subscription");
    }

    return successResponse(
      {
        userId,
        email,
        username: profile.username,
        tier: "free",
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    captureError("Register error", { error });
    return errorResponse(500, "Internal server error");
  }
}
