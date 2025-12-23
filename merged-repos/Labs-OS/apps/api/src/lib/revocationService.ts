import { PrismaClient } from "@prisma/client";
import { hashToken } from "./tokenManager";

export type RevocationReason =
  | "PASSWORD_CHANGE"
  | "LOGOUT"
  | "SECURITY_INCIDENT"
  | "DEVICE_REMOVAL"
  | "ADMIN_REVOKE"
  | "SESSION_TIMEOUT"
  | "SUSPICIOUS_ACTIVITY";

export class TokenRevocationService {
  private revocationCache = new Map<string, boolean>(); // tokenHash -> isRevoked

  constructor(private prisma: PrismaClient) {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    // Load recent revocations into memory for fast lookup
    const recentRevocations = await this.prisma.tokenRevocation.findMany({
      where: {
        revokedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: { tokenHash: true },
    });

    recentRevocations.forEach((r) => {
      this.revocationCache.set(r.tokenHash, true);
    });
  }

  async revokeToken(
    userId: string,
    token: string,
    reason: RevocationReason,
    revokedBy: string = "system"
  ): Promise<void> {
    const tokenHash = hashToken(token);

    // Write to database
    await this.prisma.tokenRevocation.create({
      data: {
        userId,
        tokenHash,
        reason,
        revokedBy,
      },
    });

    // Update cache
    this.revocationCache.set(tokenHash, true);
  }

  async revokeAllUserTokens(userId: string, reason: RevocationReason, revokedBy: string = "system"): Promise<number> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, tokenHash: true },
    });

    const tokenHashes = refreshTokens.map((t) => t.tokenHash);

    // Batch insert revocations
    await this.prisma.tokenRevocation.createMany({
      data: tokenHashes.map((hash) => ({
        userId,
        tokenHash: hash,
        reason,
        revokedBy,
      })),
    });

    // Update cache
    tokenHashes.forEach((hash) => {
      this.revocationCache.set(hash, true);
    });

    // Mark refresh tokens as revoked
    await this.prisma.refreshToken.updateMany({
      where: { id: { in: refreshTokens.map((t) => t.id) } },
      data: { revokedAt: new Date() },
    });

    return tokenHashes.length;
  }

  isTokenRevoked(tokenHash: string): boolean {
    // Fast in-memory lookup first
    if (this.revocationCache.has(tokenHash)) {
      return this.revocationCache.get(tokenHash) || false;
    }
    return false;
  }

  async checkTokenRevoked(tokenHash: string): Promise<boolean> {
    // Check cache first
    if (this.revocationCache.has(tokenHash)) {
      return this.revocationCache.get(tokenHash) || false;
    }

    // Check database if not in cache
    const revocation = await this.prisma.tokenRevocation.findFirst({
      where: { tokenHash },
    });

    if (revocation) {
      this.revocationCache.set(tokenHash, true);
      return true;
    }

    return false;
  }

  async cleanupExpiredRevocations(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await this.prisma.tokenRevocation.deleteMany({
      where: {
        revokedAt: { lt: cutoffDate },
      },
    });

    // Clear cache and reinitialize
    this.revocationCache.clear();
    await this.initializeCache();

    return result.count;
  }

  async getRevocationHistory(userId: string, limit: number = 50) {
    return await this.prisma.tokenRevocation.findMany({
      where: { userId },
      orderBy: { revokedAt: "desc" },
      take: limit,
      select: {
        reason: true,
        revokedBy: true,
        revokedAt: true,
      },
    });
  }
}