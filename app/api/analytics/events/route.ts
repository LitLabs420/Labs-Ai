import { NextRequest, NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/analytics/track
 * Track user events and analytics
 * Supports PostHog, Sentry, custom analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventName,
      userId,
      properties,
      timestamp,
      context,
    } = body;

    // Validate required fields
    if (!eventName || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: eventName, userId" },
        { status: 400 }
      );
    }

    // Create analytics event object
    const event = {
      eventName,
      userId,
      properties: properties || {},
      timestamp: timestamp || new Date().toISOString(),
      context: context || {
        ip: request.headers.get("x-forwarded-for"),
        userAgent: request.headers.get("user-agent"),
      },
    };

    // Log to analytics system (integrate with PostHog, Mixpanel, etc)
    console.log("📊 Analytics Event:", event);

    // If using external analytics service, send here
    // await sendToPostHog(event);
    // await sendToMixpanel(event);
    // await sendToSegment(event);

    // Also track in Sentry for error events
    if (eventName.includes("error")) {
      captureError(`User event: ${eventName}`, event);
    }

    return NextResponse.json({
      success: true,
      message: "Event tracked successfully",
      eventId: `${eventName}-${Date.now()}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Event tracking failed";
    console.error("Analytics tracking error:", message);

    // Don't fail the response - analytics shouldn't break user experience
    return NextResponse.json(
      {
        success: false,
        message: "Event tracking failed but operation continued",
        error: message,
      },
      { status: 200 } // 200 to avoid client-side errors
    );
  }
}

/**
 * POST /api/analytics/batch
 * Batch track multiple events at once
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, userId } = body;

    if (!Array.isArray(events) || !userId) {
      return NextResponse.json(
        { error: "Invalid request: events must be array, userId required" },
        { status: 400 }
      );
    }

    if (events.length === 0 || events.length > 100) {
      return NextResponse.json(
        { error: "Events array must contain 1-100 items" },
        { status: 400 }
      );
    }

    // Process each event
    const results = events.map((event) => ({
      ...event,
      userId,
      timestamp: event.timestamp || new Date().toISOString(),
      tracked: true,
    }));

    console.log("📊 Batch Analytics:", { count: results.length, userId });

    return NextResponse.json({
      success: true,
      message: `${results.length} events tracked`,
      count: results.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Batch tracking failed";
    return NextResponse.json(
      { error: "Batch tracking failed", message },
      { status: 200 }
    );
  }
}

/**
 * GET /api/analytics/events
 * Retrieve tracked events for a user (admin/dashboard only)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const eventName = request.nextUrl.searchParams.get("eventName");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId query param" },
        { status: 400 }
      );
    }

    // TODO: Fetch from your analytics database
    // const events = await db.analytics.findMany({
    //   where: { userId, ...(eventName && { eventName }) },
    //   take: Math.min(limit, 1000),
    //   orderBy: { timestamp: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      userId,
      eventName: eventName || "all",
      limit,
      events: [],
      message: "Connect to your analytics database to retrieve events",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Retrieval failed";
    return NextResponse.json(
      { error: "Failed to retrieve events", message },
      { status: 500 }
    );
  }
}
