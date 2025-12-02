// Optional Redis-backed rate limiter. If REDIS_URL is set, uses Redis for global limits.
// Falls back to in-memory limiter when REDIS_URL is not provided.

// Minimal constructor shapes used for runtime normalization. Kept narrow so
// TypeScript doesn't require the optional packages to be installed.
type IORedisConstructor = new (uri: string) => unknown;
type RateLimiterRedisConstructor = new (opts: { storeClient: unknown; points?: number; duration?: number; keyPrefix?: string }) => RedisLimiterLike;

type RedisConsumeResponse = { remainingPoints?: number };
type RedisRejectResponse = { msBeforeNext?: number; remainingPoints?: number };
type RedisLimiterLike = {
  consume: (key: string) => Promise<RedisConsumeResponse>
};

let redisClient: unknown = null;
let redisLimiter: RedisLimiterLike | null = null;
let initialized = false;

async function initLimiterIfNeeded() {
  if (initialized) return;
  initialized = true;
  try {
    // Dynamic import optional dependencies at runtime so the bundler doesn't 
    // fail when they aren't installed for local dev.
    const ioredisName = 'ioredis';
    const rateLimiterFlexibleName = 'rate-limiter-flexible';
    const IORedisMod = await import(ioredisName).catch(() => null);
    const RateLimiterFlexibleMod = await import(rateLimiterFlexibleName).catch(() => null);
    if (process.env.REDIS_URL && IORedisMod && RateLimiterFlexibleMod) {
      // Normalize possible default export shape without using `any`.
      const IORedisCandidate = (IORedisMod as unknown) as { default?: unknown };
      const IORedisCtor = (IORedisCandidate.default ?? IORedisMod) as unknown as IORedisConstructor;

      const RateLimiterCandidate = (RateLimiterFlexibleMod as unknown) as { default?: unknown };
      const RateLimiterFlexible = (RateLimiterCandidate.default ?? RateLimiterFlexibleMod) as unknown;

      // grab the RateLimiterRedis constructor if present
      const RateLimiterRedisCtor = ((RateLimiterFlexible as unknown) as { RateLimiterRedis?: unknown }).RateLimiterRedis as unknown as RateLimiterRedisConstructor | undefined;

      if (typeof IORedisCtor === 'function' && RateLimiterRedisCtor) {
        redisClient = new IORedisCtor(process.env.REDIS_URL); 
        redisLimiter = new RateLimiterRedisCtor({
          storeClient: redisClient,
          points: parseInt(process.env.DEMO_RATE_LIMIT || '20', 10),
          duration: parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10),
          keyPrefix: 'rl_demo',
        });
      } else {
        redisClient = null;
        redisLimiter = null;
      }
    } else {
      redisClient = null;
      redisLimiter = null;
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

export async function checkRateLimit(ip: string) {
  await initLimiterIfNeeded();
  if (redisLimiter) {
    try {
      const res = await redisLimiter.consume(ip);
      const remaining = typeof res.remainingPoints === 'number' ? res.remainingPoints : undefined;
      return { ok: true, remaining };
    } catch (rejResUnknown) {
      const rej = rejResUnknown as RedisRejectResponse & { msBeforeNext: number };
      const sec = Math.ceil((rej.msBeforeNext || 1000) / 1000) || 1;
      const remaining = typeof rej.remainingPoints === 'number' ? rej.remainingPoints : undefined;
      return { ok: false, retryAfter: sec, remaining };
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
    return { ok: false, retryAfter: Math.ceil((entry.start + WINDOW_MS - now) / 1000), remaining: 0 };
  }

  entry.count++;
  inMemoryMap.set(ip, entry);
  return { ok: true, remaining: Math.max(0, MAX_PER_WINDOW - entry.count) };
}

export default { checkRateLimit };
