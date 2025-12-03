// Optional Redis-backed rate limiter. If REDIS_URL is set, uses Redis for global limits.
// Falls back to in-memory limiter when REDIS_URL is not provided.

let redisClient: any = null;
let redisLimiter: any = null;
let initialized = false;

async function initLimiterIfNeeded() {
  if (initialized) return;
  initialized = true;
  try {
    // Lazy-require optional dependencies at runtime so the bundler doesn't
    // fail when they aren't installed for local dev.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require('ioredis');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RateLimiterFlexible = require('rate-limiter-flexible');
    if (process.env.REDIS_URL) {
      redisClient = new IORedis(process.env.REDIS_URL);
      const { RateLimiterRedis } = RateLimiterFlexible;
      redisLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        points: parseInt(process.env.DEMO_RATE_LIMIT || '20', 10),
        duration: parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10),
        keyPrefix: 'rl_demo',
      });
    }
  } catch (e) {
    // optional deps not present — fall back to in-memory limiter
    redisClient = null;
    redisLimiter = null;
  }
}

// In-memory token bucket for per-instance limits
const inMemoryMap = new Map<string, { count: number; start: number }>();
const DEFAULT_WINDOW_SEC = parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10);
const DEFAULT_DEMO_RATE_LIMIT = parseInt(process.env.DEMO_RATE_LIMIT || '20', 10);
const WINDOW_MS = DEFAULT_WINDOW_SEC * 1000;
const MAX_PER_WINDOW = DEFAULT_DEMO_RATE_LIMIT;

export async function checkRateLimit(ip: string): Promise<{ ok: boolean; retryAfter?: number }> {
  await initLimiterIfNeeded();
  if (redisLimiter) {
    try {
      await redisLimiter.consume(ip);
      return { ok: true };
    } catch (rejRes) {
      const sec = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
      return { ok: false, retryAfter: sec };
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = inMemoryMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    inMemoryMap.set(ip, { count: 1, start: now });
    return { ok: true };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((entry.start + WINDOW_MS - now) / 1000) };
  }

  // increment and persist the new count for this window
  entry.count++;
  inMemoryMap.set(ip, entry);
  return { ok: true };
}

export default { checkRateLimit };
