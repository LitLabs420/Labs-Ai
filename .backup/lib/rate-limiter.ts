import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api-utils";

/**
 * In-memory rate limiter for API endpoints
 * For production, use Redis or external service
 */
class RateLimiter {
  private limits: Map<string, { count: number; reset: number }> = new Map();
  private defaultWindow = 60 * 1000; // 1 minute
  private defaultLimit = 100; // requests per window

  /**
   * Check if request is allowed
   */
  check(key: string, limit: number = this.defaultLimit, window: number = this.defaultWindow): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || entry.reset < now) {
      // Create new entry
      this.limits.set(key, { count: 1, reset: now + window });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  remaining(key: string, limit: number = this.defaultLimit): number {
    const entry = this.limits.get(key);
    if (!entry || entry.reset < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - entry.count);
  }

  /**
   * Get reset time for a key
   */
  resetTime(key: string): Date | null {
    const entry = this.limits.get(key);
    return entry ? new Date(entry.reset) : null;
  }

  /**
   * Clear old entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.reset < now) {
        this.limits.delete(key);
      }
    }
  }
}

// Global instance
const limiter = new RateLimiter();

/**
 * Get rate limit key from request
 * Priority: API key > User ID > IP address
 */
export function getRateLimitKey(request: NextRequest): string {
  // API key takes priority
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    return `api:${apiKey}`;
  }

  // Try to get user ID from auth header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    return `user:${token.substring(0, 20)}`;
  }

  // Fall back to IP address
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

/**
 * Rate limit middleware
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 100,
  windowSeconds: number = 60
): Response | null {
  const key = getRateLimitKey(request);
  const windowMs = windowSeconds * 1000;

  const allowed = limiter.check(key, limit, windowMs);

  if (!allowed) {
    const resetTime = limiter.resetTime(key);
    return errorResponse(
      429,
      "Too Many Requests",
      `Rate limit exceeded. Try again after ${resetTime?.toISOString()}`,
      "RATE_LIMIT_EXCEEDED"
    );
  }

  return null; // Request allowed
}

/**
 * Get rate limit info for response headers
 */
export function getRateLimitHeaders(
  request: NextRequest,
  limit: number = 100
): Record<string, string> {
  const key = getRateLimitKey(request);
  const remaining = limiter.remaining(key, limit);
  const resetTime = limiter.resetTime(key);

  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": resetTime?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Different rate limits by tier
 */
export const RATE_LIMITS = {
  free: { requests: 20, window: 3600 }, // 20/hour
  starter: { requests: 100, window: 3600 }, // 100/hour
  creator: { requests: 500, window: 3600 }, // 500/hour
  pro: { requests: 2000, window: 3600 }, // 2000/hour
  agency: { requests: 10000, window: 3600 }, // 10000/hour
  admin: { requests: 100000, window: 3600 }, // Unlimited
};

/**
 * Get rate limit by user tier
 */
export function getRateLimitByTier(
  tier: string = "free"
): { requests: number; window: number } {
  return RATE_LIMITS[tier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    limiter.cleanup();
  }, 5 * 60 * 1000);
}

// Export both named and default for compatibility
export const rateLimiter = limiter;

export default {
  rateLimit,
  getRateLimitKey,
  getRateLimitHeaders,
  getRateLimitByTier,
  RATE_LIMITS,
  rateLimiter: limiter,
};
