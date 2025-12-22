import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAccessToken, newOpaqueToken, hashToken, refreshTtlDays, audit, revokeJti } from "../auth/jwt";
import { requireAuth } from "../auth/middleware";

function cookieName() {
  return process.env.AUTH_COOKIE_NAME || "labsos_refresh";
}

function cookieOptions() {
  const secure = String(process.env.AUTH_COOKIE_SECURE || "false").toLowerCase() === "true";
  const sameSite = (process.env.AUTH_COOKIE_SAMESITE || "lax") as any;
  const domain = (process.env.AUTH_COOKIE_DOMAIN || "").trim();

  const base: any = { httpOnly: true, secure, sameSite, path: "/" };
  if (domain) base.domain = domain;
  return base;
}

function permsForRole(role: string): string[] {
  const base = [
    "marketplace:asset:create",
    "marketplace:asset:list",
    "marketplace:trade:request",
  ];
  if (role === "ADMIN" || role === "MOD") base.push("marketplace:admin");
  return base;
}

export const authRouter = Router();

/**
 * DEV ONLY: passwordless login by email.
 * Creates/updates user, creates Session + RefreshToken, returns access token.
 */
authRouter.post("/dev/login", async (req, res) => {
  if (process.env.NODE_ENV !== "development") return res.status(404).json({ error: "Not available" });

  const body = z.object({
    email: z.string().email(),
    role: z.enum(["USER", "ADMIN", "MOD"]).optional(),
    deviceName: z.string().optional(),
  }).parse(req.body);

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null;
  const ua = (req.headers["user-agent"] as string) || null;

  const user = await prisma.user.upsert({
    where: { email: body.email },
    update: { role: body.role ?? "USER" },
    create: { email: body.email, role: body.role ?? "USER", status: "ACTIVE" },
  });

  await prisma.loginAttempt.create({
    data: { userId: user.id, success: true, ip: ip ? String(ip) : null, userAgent: ua },
  });

  const refreshRaw = newOpaqueToken();
  const refreshHash = hashToken(refreshRaw);
  const expiresAt = new Date(Date.now() + refreshTtlDays() * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
      deviceName: body.deviceName ?? null,
    },
  });

  await prisma.refreshToken.create({
    data: { sessionId: session.id, userId: user.id, tokenHash: refreshHash },
  });

  const perms = permsForRole(user.role);
  const signed = signAccessToken({ userId: user.id, role: user.role as any, perms });

  res.cookie(cookieName(), refreshRaw, { ...cookieOptions(), expires: expiresAt });

  await audit({
    userId: user.id,
    actorType: "USER",
    action: "auth.dev_login",
    target: session.id,
    meta: { email: body.email, role: user.role },
    ip: ip ? String(ip) : null,
    userAgent: ua,
  });

  res.json({
    accessToken: signed.token,
    ttlSeconds: signed.ttlSeconds,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

/**
 * Refresh: rotates refresh token and returns a new access token.
 */
authRouter.post("/refresh", async (req: any, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null;
  const ua = (req.headers["user-agent"] as string) || null;

  const refreshRaw = (req.cookies?.[cookieName()] as string) || "";
  if (!refreshRaw) return res.status(401).json({ error: "Missing refresh cookie" });

  const refreshHash = hashToken(refreshRaw);

  const rt = await prisma.refreshToken.findUnique({ where: { tokenHash: refreshHash } });
  if (!rt || rt.revokedAt) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const session = await prisma.session.findUnique({ where: { id: rt.sessionId } });
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    return res.status(401).json({ error: "Session invalid" });
  }

  const user = await prisma.user.findUnique({ where: { id: rt.userId } });
  if (!user || user.status !== "ACTIVE") return res.status(401).json({ error: "User inactive" });

  const newRefreshRaw = newOpaqueToken();
  const newRefreshHash = hashToken(newRefreshRaw);
  const newExpires = new Date(Date.now() + refreshTtlDays() * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { tokenHash: refreshHash },
      data: { revokedAt: new Date() },
    });
    await tx.refreshToken.create({
      data: { sessionId: session.id, userId: user.id, tokenHash: newRefreshHash },
    });
    await tx.session.update({ where: { id: session.id }, data: { expiresAt: newExpires } });
  });

  const perms = permsForRole(user.role);
  const signed = signAccessToken({ userId: user.id, role: user.role as any, perms });

  res.cookie(cookieName(), newRefreshRaw, { ...cookieOptions(), expires: newExpires });

  await audit({
    userId: user.id,
    actorType: "USER",
    action: "auth.refresh",
    target: session.id,
    meta: {},
    ip: ip ? String(ip) : null,
    userAgent: ua,
  });

  res.json({ accessToken: signed.token, ttlSeconds: signed.ttlSeconds });
});

/**
 * Logout: revokes session + refresh token; revokes current access token jti if present.
 */
authRouter.post("/logout", requireAuth, async (req: any, res) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || null;
  const ua = (req.headers["user-agent"] as string) || null;

  const userId = req.auth.userId;
  const jti = req.auth.jti;

  const refreshRaw = (req.cookies?.[cookieName()] as string) || "";
  if (refreshRaw) {
    const refreshHash = hashToken(refreshRaw);
    const rt = await prisma.refreshToken.findUnique({ where: { tokenHash: refreshHash } });
    if (rt) {
      await prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({ where: { tokenHash: refreshHash }, data: { revokedAt: new Date() } });
        await tx.session.update({ where: { id: rt.sessionId }, data: { revokedAt: new Date() } });
      });
      await audit({
        userId,
        action: "auth.logout",
        resource: "session",
        resourceId: rt.sessionId,
        ip: ip ? String(ip) : null,
        userAgent: ua,
      });
    }
  }

  if (jti) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await revokeJti({ jti, userId, expiresAt, reason: "logout" });
  }

  res.clearCookie(cookieName(), { ...cookieOptions() });
  res.json({ ok: true });
});