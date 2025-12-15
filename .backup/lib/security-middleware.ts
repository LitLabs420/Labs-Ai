import { NextRequest, NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";

/**
 * Security Headers Middleware
 * Adds critical security headers to all API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Prevent referrer leaking
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'"
  );
  
  // Disable caching for sensitive endpoints
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  
  return response;
}

/**
 * CORS Middleware
 * Validates origin and sets proper CORS headers
 */
export function validateCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean);
  
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: "CORS policy violation" },
      { status: 403 }
    );
  }
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
    response.headers.set("Access-Control-Max-Age", "3600");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }
  
  return null;
}

/**
 * Rate Limiting by IP and User
 * Prevents brute force and DoS attacks
 */
const requestLog = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = {
  public: 100, // 100 req/min for public endpoints
  auth: 5, // 5 req/min for auth endpoints
  payment: 10, // 10 req/min for payment endpoints
  default: 50, // 50 req/min default
};

export function checkRateLimit(
  identifier: string,
  type: keyof typeof MAX_REQUESTS = "default"
): boolean {
  const now = Date.now();
  const limit = MAX_REQUESTS[type];
  
  const requests = requestLog.get(identifier) || [];
  const recentRequests = requests.filter((time) => now - time < WINDOW_MS);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  requestLog.set(identifier, recentRequests);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, times] of requestLog.entries()) {
      const cleaned = times.filter((time) => now - time < WINDOW_MS);
      if (cleaned.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, cleaned);
      }
    }
  }
  
  return true;
}

/**
 * Input Sanitization
 * Removes potentially malicious content
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = Array.isArray(value)
        ? value.map((item) =>
            typeof item === "string" ? sanitizeString(item) : item
          )
        : sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Request Body Size Limit
 * Prevents large payload attacks
 */
export function checkPayloadSize(
  contentLength: string | null,
  maxMB: number = 10
): boolean {
  if (!contentLength) return true;
  const bytes = parseInt(contentLength, 10);
  const maxBytes = maxMB * 1024 * 1024;
  return bytes <= maxBytes;
}

/**
 * Log security events (without exposing sensitive data)
 */
export function logSecurityEvent(
  eventType: string,
  details: Record<string, any>,
  request: NextRequest
) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const timestamp = new Date().toISOString();
  
  // Never log passwords, tokens, or sensitive data
  const safeDetails = { ...details };
  delete safeDetails.password;
  delete safeDetails.token;
  delete safeDetails.secret;
  delete safeDetails.apiKey;
  
  console.warn(`[SECURITY] ${timestamp} - ${eventType}`, {
    ip,
    userAgent: userAgent.substring(0, 50), // Truncate
    ...safeDetails,
  });
  
  // Send to Sentry for monitoring
  captureError(`Security event: ${eventType}`, { ip, ...safeDetails });
}
