/**
 * Sentry error tracking - Server-side only
 * Use in API routes and server-side code only
 */

let Sentry: any = null;

// Only import Sentry on the server side
if (typeof window === "undefined") {
  try {
    Sentry = require("@sentry/node");
  } catch {
    console.warn("Sentry not available");
  }
}

/**
 * Initialize Sentry for error tracking and monitoring
 * Call this once in your app initialization (server-side only)
 */
export function initializeSentry() {
  if (!Sentry) {
    console.warn("Sentry is not available");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}

/**
 * Capture an error with context
 */
export function captureError(
  message: string,
  context?: Record<string, unknown>
) {
  if (!Sentry) {
    console.error(`[Error] ${message}`, context);
    return;
  }

  try {
    Sentry.captureException(new Error(message), {
      contexts: {
        error: context || {},
      },
    });
  } catch (err) {
    console.error("Sentry error capture failed:", err);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  if (!Sentry) {
    console.log(`[${level}] ${message}`);
    return;
  }

  try {
    Sentry.captureMessage(message, level);
  } catch (err) {
    console.error("Sentry message capture failed:", err);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, userData?: Record<string, unknown>) {
  if (!Sentry) return;

  try {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
  } catch (err) {
    console.error("Sentry user context failed:", err);
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!Sentry) return;

  try {
    Sentry.setUser(null);
  } catch (err) {
    console.error("Sentry user clear failed:", err);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = "info",
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  if (!Sentry) return;

  try {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  } catch (err) {
    console.error("Sentry breadcrumb failed:", err);
  }
}

export default Sentry;
