import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Role } from "./types";
import { getJwtSecret, isJtiRevoked } from "./jwt";

export type AuthContext = {
  userId: string;
  role: Role;
  perms: Set<string>;
  tokenType: "JWT" | "SERVICE";
  jti?: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      requestId?: string;
    }
  }
}

function serviceScopes(): Set<string> {
  const raw = process.env.SERVICE_SCOPES || "";
  const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
  return new Set(parts);
}

export function requestContext(req: any, _res: any, next: any) {
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
  next();
}

export async function requireAuth(req: any, res: any, next: any) {
  // Internal service token w/ scoped perms
  const service = (req.headers["x-service-token"] as string) || "";
  if (service && process.env.SERVICE_TOKEN && service === process.env.SERVICE_TOKEN) {
    req.auth = {
      userId: "service",
      role: "SERVICE",
      perms: serviceScopes(),
      tokenType: "SERVICE",
    };
    return next();
  }

  const h = (req.headers["authorization"] as string) || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: "Missing Authorization Bearer token" });

  try {
    const payload = jwt.verify(m[1], getJwtSecret()) as any;
    const userId = String(payload.sub || payload.userId || "");
    const role = (payload.role || "USER") as Role;
    const permsArr = Array.isArray(payload.perms) ? payload.perms.map(String) : [];
    const jti = String(payload.jti || "");

    if (!userId) return res.status(401).json({ error: "Invalid token (no sub)" });

    if (jti) {
      const revoked = await isJtiRevoked(jti);
      if (revoked) return res.status(401).json({ error: "Token revoked" });
    }

    req.auth = {
      userId,
      role,
      perms: new Set<string>(permsArr),
      tokenType: "JWT",
      jti: jti || undefined,
    };

    next();
  } catch (e: any) {
    return res.status(401).json({ error: "Invalid token", detail: e?.message || String(e) });
  }
}

export function requirePerm(perm: string) {
  return (req: any, res: any, next: any) => {
    if (!req.auth) return res.status(401).json({ error: "Not authenticated" });
    if (!req.auth.perms.has(perm)) return res.status(403).json({ error: "Forbidden", perm });
    next();
  };
}