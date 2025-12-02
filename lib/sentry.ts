// Lightweight Sentry wrapper. Initializes only when SENTRY_DSN is present.
let Sentry: any = null;
try {
  // lazy require so builds without @sentry/* still succeed
   
  Sentry = require('@sentry/node');
} catch (e) {
  Sentry = null;
}

export function initSentry() {
  if (!Sentry) return;
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

export function captureException(err: unknown, context?: Record<string, any>) {
  if (!Sentry) return;
  try {
    Sentry.captureException(err, { extra: context });
  } catch (e) {
    // noop
  }
}

export default { initSentry, captureException };

// Auto-initialize if env is present when this module is imported in server runtime
try {
  initSentry();
} catch (e) {
  // ignore initialization errors
}
