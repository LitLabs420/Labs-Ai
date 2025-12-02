// Simple server-side logger — gate logs in production unless explicitly enabled
const ENABLED = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SERVER_LOGS === 'true';

export function info(...args: unknown[]) {
  if (ENABLED) {
     
    console.log(...args);
  }
}

export function warn(...args: unknown[]) {
  if (ENABLED) {
     
    console.warn(...args);
  }
}

export function error(...args: unknown[]) {
  // Always log errors so they surface in production logs
   
  console.error(...args);
}

export default { info, warn, error };
