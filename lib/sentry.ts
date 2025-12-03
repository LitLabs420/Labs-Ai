import * as Sentry from '@sentry/node';

let sentryInitialized = false;

export function initSentry() {
  if (sentryInitialized) return;
  
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
    ],
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  sentryInitialized = true;
  console.log('✅ Sentry error tracking initialized');
}

export function captureError(error: Error | unknown, context?: Record<string, any>) {
  if (!sentryInitialized) return;
  
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) return;
  
  Sentry.captureMessage(message, level);
}

export default { initSentry, captureError, captureMessage };
export { Sentry };
