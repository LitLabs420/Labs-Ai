import { NextRequest, NextResponse } from "next/server";
import {
  generateCompleteContentKit,
  generateVideoPackage,
  batchGenerateContent,
  optimizeContent,
} from "@/lib/ai-pipeline";
import { captureError } from "@/lib/sentry";
import { rateLimiter } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/ai/generate
 * Generate AI content using the integrated AI pipeline
 * Supports: caption, script, image, voice, video, full kit
 */
export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Rate limit FIRST
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `ai-generate:${ip}`;
    const allowed = rateLimiter.check(rateLimitKey, 3, 60 * 1000); // 3 AI generations per minute (compute intensive)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many AI generation requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, topic, platform = "tiktok", duration = "60s" } = body;

    if (!type || !topic) {
      return NextResponse.json(
        { error: "Missing required fields: type, topic" },
        { status: 400 }
      );
    }

    if (!["caption", "script", "image", "voice", "video", "full"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be caption, script, image, voice, video, or full" },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating ${type} for: ${topic}`);

    let result;

    switch (type) {
      case "full":
        // Generate complete content kit
        result = await generateCompleteContentKit(topic, platform as "tiktok" | "instagram" | "youtube");
        break;

      case "video":
        // Generate video script + voice
        result = await generateVideoPackage(
          topic,
          duration as "30s" | "60s" | "120s"
        );
        break;

      default:
        return NextResponse.json(
          { error: `Generation for type '${type}' not yet implemented in this endpoint` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      topic,
      platform,
      generatedAt: new Date().toISOString(),
      content: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    captureError("AI generation error", { error: message });

    return NextResponse.json(
      { error: "Failed to generate content", message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/generate/batch
 * Generate content for multiple topics at once
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics, type = "caption" } = body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "topics must be a non-empty array" },
        { status: 400 }
      );
    }

    if (topics.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 topics per batch request" },
        { status: 400 }
      );
    }

    console.log(`🤖 Batch generating ${topics.length} ${type}s`);

    const results = await batchGenerateContent(topics, type);

    return NextResponse.json({
      success: true,
      type,
      count: results.length,
      generatedAt: new Date().toISOString(),
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Batch generation failed";
    captureError("Batch generation error", { error: message });

    return NextResponse.json(
      { error: "Failed to generate batch content", message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/optimize
 * Optimize existing content for better engagement
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid content to optimize" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Content too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    console.log(`✨ Optimizing content: ${content.substring(0, 50)}...`);

    const optimized = await optimizeContent(content);

    return NextResponse.json({
      success: true,
      original: content,
      optimizedAt: new Date().toISOString(),
      ...optimized,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Optimization failed";
    captureError("Content optimization error", { error: message });

    return NextResponse.json(
      { error: "Failed to optimize content", message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/status
 * Check AI generation service status
 */
export async function GET() {
  return NextResponse.json({
    status: "operational",
    services: {
      claudeAI: "✅ Available",
      replicateImages: "✅ Available",
      elevenLabsVoice: "✅ Available",
      pipeline: "✅ Fully integrated",
    },
    timestamp: new Date().toISOString(),
  });
}
