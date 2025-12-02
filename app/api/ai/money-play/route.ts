import { NextRequest, NextResponse } from "next/server";
import { generateMoneyPlay } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';
import sentry from '@/lib/sentry';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userNiche, recentBookings, userRevenue } = body as any;

    const recaptchaToken = (body as any)?.recaptchaToken;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }

    if (!userNiche) {
      return NextResponse.json(
        { error: "Missing required field: userNiche" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const moneyPlay = await generateMoneyPlay(
      userNiche,
      recentBookings || 0,
      userRevenue || 0
    );

    const res = NextResponse.json(moneyPlay);
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("Money play generation error:", error);
    sentry.captureException(error as unknown);
    return NextResponse.json(
      { error: "Failed to generate money play" },
      { status: 500 }
    );
  }
}
