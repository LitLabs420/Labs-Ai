import { NextResponse } from "next/server";
import { captureError } from "@/lib/sentry";

/**
 * Standardized API response types
 */
export interface APIErrorResponse {
  error: string;
  message?: string;
  code?: string;
  statusCode: number;
}

export interface APISuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  statusCode: number,
  error: string,
  message?: string,
  code?: string
) {
  const response: APIErrorResponse = {
    error,
    message: message || error,
    code: code || `ERROR_${statusCode}`,
    statusCode,
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a standardized success response
 */
export function successResponse<T = unknown>(
  data?: T,
  message?: string,
  statusCode: number = 200
) {
  const response: APISuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Handle API errors with logging and proper response
 */
export function handleAPIError(
  error: unknown,
  context: string = "API",
  statusCode: number = 500
) {
  const message = error instanceof Error ? error.message : String(error);
  
  captureError(`${context} Error`, {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
  });

  return errorResponse(
    statusCode,
    "Internal Server Error",
    message,
    `${context.toUpperCase()}_ERROR`
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = fields.filter((field) => !body[field]);
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

/**
 * Validate field against allowed values
 */
export function validateEnum(
  value: string,
  allowedValues: string[],
  fieldName: string
): { valid: boolean; error?: string } {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(", ")}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safe JSON parse with error handling
 */
export function safeParse<T = unknown>(json: string, fallback?: T): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback || null;
  }
}

export default {
  errorResponse,
  successResponse,
  handleAPIError,
  validateRequired,
  validateEnum,
  validateEmail,
  validateUUID,
  safeParse,
};
