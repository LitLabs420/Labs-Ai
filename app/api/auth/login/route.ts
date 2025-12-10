import { NextRequest } from "next/server";
import { supabase } from "@/lib/database";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { captureError } from "@/lib/sentry";
import bcrypt from "bcryptjs";

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Generate JWT token for user
 */
function generateToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  ).toString("base64url");

  // Note: In production, sign with HMAC using a secret key
  // This is a simplified version for demo purposes
  const signature = Buffer.from("demo-signature").toString("base64url");
  return `${header}.${payload}.${signature}`;
}

/**
 * POST /api/auth/login
 * Authenticate user and return session token
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse(400, "Email and password are required");
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, password_hash, premium_tier")
      .eq("email", email.toLowerCase())
      .single();

    if (profileError || !profile) {
      captureError("Login failed - user not found", { email });
      return errorResponse(401, "Invalid email or password");
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, profile.password_hash || "");
    if (!passwordMatch) {
      captureError("Login failed - invalid password", { email });
      return errorResponse(401, "Invalid email or password");
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", profile.id)
      .eq("status", "active")
      .single();

    const tier = subscription?.tier || profile.premium_tier || "free";

    // Generate token
    const token = generateToken(profile.id, profile.email);

    // Create or update session
    const sessionToken = crypto.randomUUID();
    const { error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: profile.id,
        token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    if (sessionError) {
      captureError("Failed to create session", { error: sessionError });
      return errorResponse(500, "Failed to create session");
    }

    const response = successResponse({
      userId: profile.id,
      email: profile.email,
      tier,
      token,
      sessionToken,
    });

    // Set session cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    captureError("Login error", { error });
    return errorResponse(500, "Internal server error");
  }
}
