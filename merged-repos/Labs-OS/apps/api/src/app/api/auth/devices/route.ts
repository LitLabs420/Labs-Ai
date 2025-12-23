import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "@/lib/tokenManager";
import { DeviceSessionTracker } from "@/lib/deviceTracker";
import { AuditLogger } from "@/lib/auditLogger";
import { TokenRevocationService } from "@/lib/revocationService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const deviceTracker = new DeviceSessionTracker(prisma);
const auditLogger = new AuditLogger(prisma);
const revocationService = new TokenRevocationService(prisma);

// GET /api/auth/devices - List all active devices
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const devices = await deviceTracker.getActiveDevices(payload.userId);

    await auditLogger.log({
      userId: payload.userId,
      action: "DEVICE_LIST",
      status: "SUCCESS",
      severity: "DEBUG",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error("Device list error:", error);
    return NextResponse.json({ error: "Failed to list devices" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/auth/devices/:deviceId - Revoke specific device
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID required" }, { status: 400 });
    }

    // Verify the device belongs to the user
    const device = await prisma.deviceSession.findUnique({
      where: { id: deviceId },
    });

    if (!device || device.userId !== payload.userId) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Revoke the device
    await deviceTracker.revokeDeviceSession(deviceId);

    // Revoke all tokens for this device
    const tokensRevoked = await prisma.refreshToken.findMany({
      where: { deviceSessionId: deviceId, revokedAt: null },
      select: { id: true, token: true },
    });

    for (const token of tokensRevoked) {
      await revocationService.revokeToken(payload.userId, token.token, "DEVICE_REMOVAL");
    }

    await auditLogger.log({
      userId: payload.userId,
      action: "DEVICE_REVOKE",
      status: "SUCCESS",
      resourceId: deviceId,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ success: true, revokedTokens: tokensRevoked.length });
  } catch (error) {
    console.error("Device revocation error:", error);
    return NextResponse.json({ error: "Failed to revoke device" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/auth/devices/revoke-all - Revoke all devices except current
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { keepDeviceSessionId } = await request.json();

    if (!keepDeviceSessionId) {
      return NextResponse.json(
        { error: "Keep device ID required" },
        { status: 400 }
      );
    }

    const revokedCount = await deviceTracker.revokeAllDevicesExcept(
      payload.userId,
      keepDeviceSessionId
    );

    await auditLogger.log({
      userId: payload.userId,
      action: "DEVICE_REVOKE_ALL",
      status: "SUCCESS",
      severity: "WARN",
      metadata: { revokedCount },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      revokedDevices: revokedCount,
    });
  } catch (error) {
    console.error("Revoke all devices error:", error);
    return NextResponse.json(
      { error: "Failed to revoke devices" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}