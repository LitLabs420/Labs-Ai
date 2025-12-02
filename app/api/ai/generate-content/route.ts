import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const { niche, contentType, description, tone } = await req.json();

    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!niche || !contentType || !description) {
      return NextResponse.json(
        { error: "Missing required fields: niche, contentType, description" },
        { status: 400 }
      );
    }

    // Generate content using Google Gemini
    // Rate limit per-IP/token
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const result = await generateContent({
      niche,
      contentType,
      description,
      tone: tone || "casual",
    });

    const res = NextResponse.json(result);
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
