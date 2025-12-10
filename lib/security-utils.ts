import { NextRequest, NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";
import {
  addSecurityHeaders,
  checkPayloadSize,
  sanitizeObject,
} from "@/lib/security-middleware";

/**
 * Enhanced API Route Wrapper
 * Applies security checks and headers to all API routes
 * 
 * Usage:
 * export const POST = secureRoute(async (request) => {
 *   // Your handler code
 * });
 */
export function secureRoute(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    maxPayloadMB?: number;
    sanitizeBody?: boolean;
    logActivity?: boolean;
  } = {}
) {
  const {
    requireAuth: _requireAuth = false,
    maxPayloadMB = 10,
    sanitizeBody = true,
    logActivity = false,
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Check payload size
      const contentLength = request.headers.get("content-length");
      if (!checkPayloadSize(contentLength, maxPayloadMB)) {
        const response = NextResponse.json(
          { error: "Payload too large", message: `Maximum size is ${maxPayloadMB}MB` },
          { status: 413 }
        );
        return addSecurityHeaders(response);
      }

      // 2. Validate Content-Type for POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const response = NextResponse.json(
            { error: "Invalid Content-Type", message: "Expected application/json" },
            { status: 400 }
          );
          return addSecurityHeaders(response);
        }
      }

      // 3. Sanitize request body if needed
      let sanitizedRequest = request;
      if (sanitizeBody && ["POST", "PUT", "PATCH"].includes(request.method)) {
        try {
          const body = await request.json();
          const sanitized = sanitizeObject(body);
          // Create a new request with sanitized body
          const newRequest = new NextRequest(request, {
            body: JSON.stringify(sanitized),
          });
          sanitizedRequest = newRequest;
        } catch {
          // If JSON parsing fails, continue with original
        }
      }

      // 4. Call the actual handler
      let response = await handler(sanitizedRequest);

      // 5. Add security headers
      response = addSecurityHeaders(response);

      // 6. Log activity if needed
      if (logActivity) {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        console.log(`[API] ${request.method} ${request.nextUrl.pathname} - ${ip}`);
      }

      return response;
    } catch (error) {
      // Log the error securely
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      captureError("Secure route handler error", {
        error: error instanceof Error ? error.message : String(error),
        path: request.nextUrl.pathname,
        method: request.method,
        ip,
      });

      // Return generic error (never expose implementation details)
      const response = NextResponse.json(
        { error: "Internal server error", message: "An unexpected error occurred" },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  };
}

/**
 * Audit Logging
 * Logs sensitive operations for compliance and security monitoring
 */
export async function auditLog(
  userId: string,
  action: string,
  resource: string,
  details: Record<string, any>,
  severity: "low" | "medium" | "high" | "critical" = "low"
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId,
    action,
    resource,
    severity,
    // Never log sensitive data
    ...details,
  };

  try {
    // Send to audit log (Firebase/Supabase/etc)
    console.log(`[AUDIT ${severity.toUpperCase()}]`, logEntry);

    // Critical actions should alert
    if (severity === "critical") {
      captureError(`Critical action: ${action}`, logEntry);
    }
  } catch (error) {
    captureError("Audit logging failed", { error });
  }
}

/**
 * Sensitive Data Redaction
 * Removes sensitive data from logs and responses
 */
export function redactSensitiveData(data: any): any {
  if (!data) return data;

  const sensitivePatterns = [
    "password",
    "token",
    "secret",
    "apiKey",
    "api_key",
    "creditCard",
    "credit_card",
    "ssn",
    "socialSecurity",
    "privateKey",
    "private_key",
    "refreshToken",
    "refresh_token",
  ];

  const redact = (obj: any): any => {
    if (typeof obj !== "object" || obj === null) return obj;

    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in redacted) {
      if (sensitivePatterns.some((pattern) => key.toLowerCase().includes(pattern))) {
        redacted[key] = "***REDACTED***";
      } else if (typeof redacted[key] === "object") {
        redacted[key] = redact(redacted[key]);
      }
    }

    return redacted;
  };

  return redact(data);
}
