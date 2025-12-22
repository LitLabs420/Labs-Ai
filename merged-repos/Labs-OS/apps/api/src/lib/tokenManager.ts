import crypto from "crypto";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  deviceSessionId?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateTokenPair(payload: TokenPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return decoded as TokenPayload;
  } catch (e) {
    return null;
  }
}

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

export function calculateTokenExpiry(expiryString: string): Date {
  const now = new Date();
  const value = parseInt(expiryString);
  const unit = expiryString.match(/[a-z]+/i)?.[0] || "s";

  switch (unit.toLowerCase()) {
    case "m":
      now.setMinutes(now.getMinutes() + value);
      break;
    case "h":
      now.setHours(now.getHours() + value);
      break;
    case "d":
      now.setDate(now.getDate() + value);
      break;
    default:
      now.setSeconds(now.getSeconds() + value);
  }

  return now;
}

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_ROTATION_COUNT: 5, // Refresh tokens can be rotated max 5 times
  ROTATION_THRESHOLD_MS: 60 * 1000, // Refresh only if < 1 min left (for safety)
};