import { NextRequest, NextResponse } from "next/server";
import { Initializer, initializeServer } from "@/lib/server-initializer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health check endpoint - Returns detailed system status
 * GET /api/health
 */
export async function GET() {
  try {
    const status = Initializer.getStatus();
    const isHealthy = status.allHealthy;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        timestamp: status.timestamp,
        services: {
          firebase: status.firebase.initialized,
          googleAI: status.googleAI.initialized,
          openAI: status.openAI.initialized,
          stripe: status.stripe.initialized,
          nats: status.nats.initialized,
          redis: status.redis.initialized,
          email: status.email.initialized,
        },
        errors: Object.entries(status)
          .filter(([key, val]: any) => val.error && key !== "timestamp" && key !== "allHealthy")
          .reduce((acc, [key, val]: any) => ({ ...acc, [key]: val.error }), {}),
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "X-System-Healthy": isHealthy ? "true" : "false",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { status: "error", error: "Health check failed" },
      { status: 500 }
    );
  }
}

/**
 * Initialize server on demand
 * POST /api/health
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.INTERNAL_WEBHOOK_SECRET;

    if (!expectedToken || !authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - missing auth header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized - invalid token" },
        { status: 401 }
      );
    }

    const status = await initializeServer();

    return NextResponse.json(
      {
        message: "Server initialization complete",
        status: status.allHealthy ? "healthy" : "degraded",
        timestamp: status.timestamp,
        services: {
          firebase: status.firebase.initialized,
          googleAI: status.googleAI.initialized,
          openAI: status.openAI.initialized,
          stripe: status.stripe.initialized,
          nats: status.nats.initialized,
          redis: status.redis.initialized,
          email: status.email.initialized,
        },
      },
      {
        status: status.allHealthy ? 200 : 503,
      }
    );
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json(
      {
        error: "Initialization failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
