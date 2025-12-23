import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

export type Role = "USER" | "ADMIN" | "MOD" | "SERVICE";

export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET missing");
  return s;
}

export function accessTtlSeconds(): number {
  const n = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || "900");
  return Number.isFinite(n) ? n : 900;
}

export function refreshTtlDays(): number {
  const n = Number(process.env.REFRESH_TOKEN_TTL_DAYS || "30");
  return Number.isFinite(n) ? n : 30;
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function newOpaqueToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function signAccessToken(params: { userId: string; role: Role; perms: string[] }) {
  const jti = crypto.randomUUID();
  const ttl = accessTtlSeconds();
  const token = jwt.sign(
    { role: params.role, perms: params.perms, jti },
    getJwtSecret(),
    { subject: params.userId, expiresIn: ttl }
  );
  return { token, jti, ttlSeconds: ttl };
}

export async function isJtiRevoked(jti: string): Promise<boolean> {
  const hit = await prisma.tokenRevocation.findUnique({ where: { jti } });
  return !!hit;
}

export async function revokeJti(params: { jti: string; expiresAt: Date }) {
  await prisma.tokenRevocation.upsert({
    where: { jti: params.jti },
    update: { expiresAt: params.expiresAt },
    create: { jti: params.jti, expiresAt: params.expiresAt },
  });
}

export async function audit(params: {
  userId?: string | null;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource ?? null,
      resourceId: params.resourceId ?? null,
      ip: params.ip ?? null,
    },
  });
}