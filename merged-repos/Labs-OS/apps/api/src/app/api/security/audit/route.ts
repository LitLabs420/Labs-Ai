import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/tokenManager";
import { AuditLogger } from "@/lib/auditLogger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const auditLogger = new AuditLogger(prisma);

// GET /api/security/audit-trail - Get user audit log
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action");

    let where: any = { userId: payload.userId };
    if (action) {
      where.action = action;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        action: true,
        resource: true,
        status: true,
        severity: true,
        statusCode: true,
        errorMessage: true,
        ipAddress: true,
        createdAt: true,
        deviceSession: {
          select: {
            deviceName: true,
            deviceType: true,
            country: true,
          },
        },
      },
    });

    const total = await prisma.auditLog.count({ where });

    return NextResponse.json({
      data: auditLogs,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Audit trail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit trail" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/security/logins - Get recent login attempts
export async function GET(request: NextRequest, { params }: any) {
  if (request.nextUrl.pathname.includes("/logins")) {
    try {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const payload = verifyAccessToken(token);
      if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const recentLogins = await auditLogger.getRecentLogins(payload.userId, 20);
      const failedAttempts = await auditLogger.getFailedAttempts(payload.userId, "AUTH_LOGIN", 24);

      return NextResponse.json({
        successfulLogins: recentLogins,
        failedAttempts: failedAttempts.length,
        recentFailures: failedAttempts,
      });
    } catch (error) {
      console.error("Login history error:", error);
      return NextResponse.json(
        { error: "Failed to fetch login history" },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }
}

// GET /api/security/anomalies - Detect suspicious activities
export async function GET(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/anomalies")) {
    try {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const payload = verifyAccessToken(token);
      if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const anomalies = await auditLogger.detectAnomalies(payload.userId);

      return NextResponse.json({
        anomalies,
        hasAnomalies: anomalies.length > 0,
      });
    } catch (error) {
      console.error("Anomaly detection error:", error);
      return NextResponse.json(
        { error: "Failed to detect anomalies" },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }
}