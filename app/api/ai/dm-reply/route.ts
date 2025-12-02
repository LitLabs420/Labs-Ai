import { NextRequest, NextResponse } from "next/server";
import { generateDMReply } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const { incomingMessage, userNiche, userContext } = await req.json();

    if (!incomingMessage || !userNiche) {
      return NextResponse.json(
        { error: "Missing required fields: incomingMessage, userNiche" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const reply = await generateDMReply(incomingMessage, userNiche, userContext || "");

    const res = NextResponse.json({ reply });
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("DM reply generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate DM reply" },
      { status: 500 }
    );
  }
}
