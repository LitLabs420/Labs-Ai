// @ts-nocheck
// Lightweight Sentry wrapper. Initializes only when SENTRY_DSN is present.
type SentryLike = {
  init?: (opts: { dsn?: string; tracesSampleRate?: number }) => void;
  captureException?: (err: unknown, opts?: unknown) => void;
};

let SentryModule: SentryLike | null = null;

// Attempt a background dynamic import and initialization if SENTRY_DSN is present.
(async function tryInit() {
  if (!process.env.SENTRY_DSN) return;
  try {
    const mod = await import('@sentry/node');
    // Normalize to our Sentry-like shape without `any` casts
    const maybe = (mod as unknown) as SentryLike;
    SentryModule = maybe;
    if (typeof maybe.init === 'function') {
      maybe.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
    }
  } catch (e) {
    SentryModule = null;
  }
})();

export function initSentry() {
  // No-op when module isn't available; the background init will occur if DSN is present.
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  try {
    if (!SentryModule || typeof SentryModule.captureException !== 'function') return;
    SentryModule.captureException?.(err, { extra: context } as unknown);
  } catch (e) {
    // noop
  }
}

export default { initSentry, captureException };
