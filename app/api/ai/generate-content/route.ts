import { NextRequest, NextResponse } from "next/server";
import { generateContent, GenerateContentRequest } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';
import sentry from '@/lib/sentry';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = body as Record<string, unknown>;
    const description = parsed.description as string | undefined;

    // Validate niche/contentType/tone against allowed values
    const allowedNiches = ["barber", "lash_tech", "nail_tech", "aesthetician", "salon"] as const;
    const allowedContentTypes = ["instagram_caption", "tiktok_script", "email", "dm_opener", "money_play"] as const;
    const allowedTones = ["casual", "professional", "funny", "urgent"] as const;

    function isStringArrayMember<T extends readonly string[]>(arr: T, v: unknown): v is T[number] {
      return typeof v === 'string' && (arr as readonly string[]).includes(v);
    }

    const niche = isStringArrayMember(allowedNiches, parsed.niche) ? parsed.niche : undefined;
    const contentType = isStringArrayMember(allowedContentTypes, parsed.contentType) ? parsed.contentType : undefined;
    const tone = isStringArrayMember(allowedTones, parsed.tone) ? parsed.tone : undefined;

    // If RECAPTCHA_SECRET is set, verify token included in body
    const recaptchaToken = parsed.recaptchaToken as string | undefined;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }

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
    sentry.captureException(error as unknown);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
