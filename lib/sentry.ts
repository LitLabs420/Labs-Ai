// Lightweight Sentry wrapper. Initializes only when SENTRY_DSN is present.
let Sentry: any = null;
try {
  // lazy require so builds without @sentry/* still succeed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
