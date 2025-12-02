// Lightweight Sentry wrapper. Initializes only when SENTRY_DSN is present.
let SentryModule: unknown = null;

// Attempt a background dynamic import and initialization if SENTRY_DSN is present.
(async function tryInit() {
  if (!process.env.SENTRY_DSN) return;
  try {
    const mod = await import('@sentry/node');
    // @ts-expect-error - dynamic import types
    SentryModule = mod;
    // @ts-expect-error - init may be missing in test env
    mod.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  } catch (e) {
    SentryModule = null;
  }
})();

export function initSentry() {
  // No-op when module isn't available; the background init will occur if DSN is present.
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!SentryModule || typeof (SentryModule as any).captureException !== 'function') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (SentryModule as any).captureException(err, { extra: context });
  } catch (e) {
    // noop
  }
}

export default { initSentry, captureException };
