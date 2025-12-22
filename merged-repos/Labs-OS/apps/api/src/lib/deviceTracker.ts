import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  deviceType: string; // MOBILE, DESKTOP, TABLET
  deviceOS?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent: string;
  ipAddress: string;
}

interface LocationInfo {
  country?: string;
  city?: string;
  timezone?: string;
  isp?: string;
}

interface DeviceFingerprint {
  fingerprint: string;
  hash: string;
}

export class DeviceSessionTracker {
  constructor(private prisma: PrismaClient) {}

  generateDeviceId(userAgent: string, ipAddress: string): string {
    const combined = `${userAgent}:${ipAddress}`;
    return crypto.createHash("sha256").update(combined).digest("hex");
  }

  generateFingerprint(info: DeviceInfo & LocationInfo): DeviceFingerprint {
    const components = [
      info.userAgent,
      info.ipAddress,
      info.deviceType,
      info.browserName,
      info.browserVersion,
      info.country,
      info.timezone,
    ]
      .filter(Boolean)
      .join("|");

    return {
      fingerprint: components,
      hash: crypto.createHash("sha256").update(components).digest("hex"),
    };
  }

  async createOrUpdateDeviceSession(
    userId: string,
    deviceInfo: DeviceInfo,
    locationInfo: LocationInfo
  ) {
    const deviceId =
      deviceInfo.deviceId || this.generateDeviceId(deviceInfo.userAgent, deviceInfo.ipAddress);
    const fingerprint = this.generateFingerprint({ ...deviceInfo, ...locationInfo });

    try {
      // Try to find existing session by fingerprint
      const existing = await this.prisma.deviceSession.findUnique({
        where: { fingerprintHash: fingerprint.hash },
      });

      if (existing && existing.userId === userId) {
        // Update last activity
        return await this.prisma.deviceSession.update({
          where: { id: existing.id },
          data: {
            lastActivityAt: new Date(),
            lastIpAddress: deviceInfo.ipAddress,
          },
        });
      }

      // Create new device session
      return await this.prisma.deviceSession.create({
        data: {
          userId,
          deviceId,
          deviceName: deviceInfo.deviceName,
          deviceType: deviceInfo.deviceType,
          deviceOS: deviceInfo.deviceOS,
          browserName: deviceInfo.browserName,
          browserVersion: deviceInfo.browserVersion,
          fingerprint: fingerprint.fingerprint,
          fingerprintHash: fingerprint.hash,
          ipAddress: deviceInfo.ipAddress,
          country: locationInfo.country,
          city: locationInfo.city,
          timezone: locationInfo.timezone,
          status: "ACTIVE",
        },
      });
    } catch (error) {
      // Handle unique constraint violation (duplicate device)
      if ((error as any).code === "P2002") {
        return await this.prisma.deviceSession.findUnique({
          where: { fingerprintHash: fingerprint.hash },
        });
      }
      throw error;
    }
  }

  async revokeDeviceSession(deviceSessionId: string) {
    return await this.prisma.deviceSession.update({
      where: { id: deviceSessionId },
      data: { status: "REVOKED" },
    });
  }

  async getActiveDevices(userId: string) {
    return await this.prisma.deviceSession.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        deviceOS: true,
        browserName: true,
        ipAddress: true,
        country: true,
        city: true,
        lastActivityAt: true,
        loginAt: true,
      },
      orderBy: { lastActivityAt: "desc" },
    });
  }

  async revokeAllDevicesExcept(userId: string, keepDeviceSessionId: string) {
    const devices = await this.prisma.deviceSession.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true },
    });

    const toRevoke = devices.filter((d) => d.id !== keepDeviceSessionId);

    if (toRevoke.length === 0) return 0;

    const result = await this.prisma.deviceSession.updateMany({
      where: { id: { in: toRevoke.map((d) => d.id) } },
      data: { status: "REVOKED" },
    });

    return result.count;
  }

  parseUserAgent(userAgent: string) {
    // Simple parser - use ua-parser-js for production
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isMobile ? "MOBILE" : isTablet ? "TABLET" : "DESKTOP";

    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browserName = "Chrome";
      browserVersion = userAgent.match(/Chrome\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/safari/i.test(userAgent)) {
      browserName = "Safari";
      browserVersion = userAgent.match(/Version\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/firefox/i.test(userAgent)) {
      browserName = "Firefox";
      browserVersion = userAgent.match(/Firefox\/([^\s]+)/)?.[1] || "Unknown";
    }

    let deviceOS = "Unknown";
    if (/windows/i.test(userAgent)) deviceOS = "Windows";
    else if (/macintosh|macos/i.test(userAgent)) deviceOS = "macOS";
    else if (/linux/i.test(userAgent)) deviceOS = "Linux";
    else if (/android/i.test(userAgent)) deviceOS = "Android";
    else if (/iphone|ios/i.test(userAgent)) deviceOS = "iOS";

    return { deviceType, browserName, browserVersion, deviceOS };
  }
}