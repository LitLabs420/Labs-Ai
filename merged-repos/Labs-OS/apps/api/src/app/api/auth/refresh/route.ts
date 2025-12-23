import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken, generateTokenPair, hashToken, TOKEN_CONFIG } from "@/lib/tokenManager";
import { TokenRevocationService } from "@/lib/revocationService";
import { DeviceSessionTracker } from "@/lib/deviceTracker";
import { AuditLogger } from "@/lib/auditLogger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const revocationService = new TokenRevocationService(prisma);
const deviceTracker = new DeviceSessionTracker(prisma);
const auditLogger = new AuditLogger(prisma);

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    // Check if token is revoked
    const tokenHash = hashToken(refreshToken);
    if (await revocationService.checkTokenRevoked(tokenHash)) {
      return NextResponse.json(
        { error: "Refresh token revoked" },
        { status: 401 }
      );
    }

    // Find refresh token in DB
    const dbToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!dbToken || dbToken.userId !== dbToken.user?.id) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (dbToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Refresh token expired" },
        { status: 401 }
      );
    }

    if (dbToken.revokedAt) {
      return NextResponse.json(
        { error: "Refresh token revoked" },
        { status: 401 }
      );
    }

    // Check rotation limit
    if (dbToken.rotationCount >= TOKEN_CONFIG.MAX_ROTATION_COUNT) {
      await auditLogger.logSecurityIncident(
        dbToken.userId,
        "TOKEN_ROTATION_LIMIT_EXCEEDED",
        { rotationCount: dbToken.rotationCount }
      );
      
      return NextResponse.json(
        { error: "Token rotation limit exceeded. Please login again." },
        { status: 401 }
      );
    }

    // Generate new token pair
    const newTokenPair = generateTokenPair({
      userId: dbToken.user.id,
      email: dbToken.user.email,
      role: dbToken.user.role,
      deviceSessionId: dbToken.deviceSessionId || undefined,
    });

    // Rotate refresh token (revoke old, create new)
    await revocationService.revokeToken(
      dbToken.userId,
      refreshToken,
      "TOKEN_REFRESH"
    );

    const newDbToken = await prisma.refreshToken.create({
      data: {
        userId: dbToken.user.id,
        token: newTokenPair.refreshToken,
        tokenHash: hashToken(newTokenPair.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rotationCount: dbToken.rotationCount + 1,
        lastRotatedAt: new Date(),
        ipAddress,
        userAgent,
        deviceSessionId: dbToken.deviceSessionId,
      },
    });

    // Log successful refresh
    await auditLogger.log({
      userId: dbToken.user.id,
      action: "TOKEN_REFRESH",
      status: "SUCCESS",
      severity: "DEBUG",
      ipAddress,
      userAgent,
      deviceSessionId: dbToken.deviceSessionId || undefined,
      metadata: { rotationCount: newDbToken.rotationCount },
    });

    return NextResponse.json(
      {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresIn: newTokenPair.expiresIn,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}