import * as Sentry from "@sentry/node";

/**
 * Initialize Sentry for error tracking and monitoring
 * Call this once in your app initialization
 */
export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
  });
}

/**
 * Capture an error with context
 */
export function captureError(
  message: string,
  context?: Record<string, unknown>
) {
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
export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" | "debug" = "info") {
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
