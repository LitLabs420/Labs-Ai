import { PrismaClient } from "@prisma/client";

export type AuditAction = 
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "AUTH_REGISTER"
  | "TOKEN_REFRESH"
  | "TOKEN_REVOKE"
  | "PASSWORD_CHANGE"
  | "EMAIL_CHANGE"
  | "DEVICE_ADD"
  | "DEVICE_REMOVE"
  | "DEVICE_REVOKE"
  | "PAYMENT_INITIATED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "LISTING_CREATE"
  | "LISTING_UPDATE"
  | "LISTING_DELETE"
  | "PROFILE_UPDATE"
  | "SECURITY_INCIDENT"
  | "ADMIN_ACTION"
  | "EMAIL_VERIFICATION"
  | "PASSWORD_RESET";

export type AuditStatus = "SUCCESS" | "FAILURE" | "PENDING";
export type AuditSeverity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  status: AuditStatus;
  severity?: AuditSeverity;
  statusCode?: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceSessionId?: string;
  changesBefore?: Record<string, any>;
  changesAfter?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  constructor(private prisma: PrismaClient) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          status: entry.status,
          severity: entry.severity || "INFO",
          statusCode: entry.statusCode,
          errorMessage: entry.errorMessage,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          deviceSessionId: entry.deviceSessionId,
          changesBefore: entry.changesBefore ? JSON.stringify(entry.changesBefore) : null,
          changesAfter: entry.changesAfter ? JSON.stringify(entry.changesAfter) : null,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        },
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
      // Don't throw - audit logging should not break the app
    }
  }

  async getAuditTrail(userId: string, limit: number = 100, offset: number = 0) {
    return await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        action: true,
        resource: true,
        status: true,
        severity: true,
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
  }

  async getRecentLogins(userId: string, limit: number = 10) {
    return await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: "AUTH_LOGIN",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        status: true,
        statusCode: true,
        ipAddress: true,
        createdAt: true,
        deviceSession: {
          select: {
            deviceName: true,
            deviceOS: true,
            country: true,
          },
        },
      },
    });
  }

  async getFailedAttempts(userId: string, action: AuditAction, hours: number = 1) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await this.prisma.auditLog.findMany({
      where: {
        userId,
        action,
        status: "FAILURE",
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        errorMessage: true,
        ipAddress: true,
        createdAt: true,
      },
    });
  }

  async detectAnomalies(userId: string): Promise<string[]> {
    const anomalies: string[] = [];

    // Check for multiple failed login attempts
    const failedLogins = await this.getFailedAttempts(userId, "AUTH_LOGIN", 1);
    if (failedLogins.length >= 5) {
      anomalies.push("MULTIPLE_FAILED_LOGINS");
    }

    // Check for logins from multiple countries in short time
    const recentLogins = await this.getRecentLogins(userId, 5);
    const uniqueCountries = new Set(
      recentLogins
        .map((l) => l.deviceSession?.country)
        .filter(Boolean)
    );
    if (uniqueCountries.size >= 3) {
      anomalies.push("IMPOSSIBLE_TRAVEL");
    }

    return anomalies;
  }

  async logSecurityIncident(
    userId: string,
    incident: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: "SECURITY_INCIDENT",
      status: "FAILURE",
      severity: "CRITICAL",
      metadata: { incident, ...details },
    });
  }
}