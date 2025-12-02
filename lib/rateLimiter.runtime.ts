// @ts-nocheck
// Runtime-only optional imports for Redis-backed rate limiter.
// Kept in a separate file and `ts-nocheck` to avoid CI type-check failures when
// optional packages are not installed.

let initialized = false;
let redisClient = null;
let redisLimiter = null;

const ioredisName = 'ioredis';
const rateLimiterFlexibleName = 'rate-limiter-flexible';

export async function runtimeConsume(ip) {
  if (initialized && redisLimiter) {
    try {
      const res = await redisLimiter.consume(ip);
      return { ok: true, remaining: typeof res?.remainingPoints === 'number' ? res.remainingPoints : undefined };
    } catch (rej) {
      const sec = Math.ceil((rej?.msBeforeNext || 1000) / 1000) || 1;
      return { ok: false, retryAfter: sec, remaining: typeof rej?.remainingPoints === 'number' ? rej.remainingPoints : undefined };
    }
  }

  initialized = true;
  try {
    let IORedisMod = null;
    let RateLimiterFlexibleMod = null;
    try {
      // Use an indirect `import()` via Function to avoid static bundler resolution.
      IORedisMod = await (new Function('n', 'return import(n)')(ioredisName));
    } catch (_) {
      IORedisMod = null;
    }
    try {
      RateLimiterFlexibleMod = await (new Function('n', 'return import(n)')(rateLimiterFlexibleName));
    } catch (_) {
      RateLimiterFlexibleMod = null;
    }

    if (process.env.REDIS_URL && IORedisMod && RateLimiterFlexibleMod) {
      const IORedis = (IORedisMod.default || IORedisMod);
      const RateLimiterFlexible = (RateLimiterFlexibleMod.default || RateLimiterFlexibleMod);
      const RateLimiterRedis = RateLimiterFlexible?.RateLimiterRedis;
      if (typeof IORedis === 'function' && RateLimiterRedis) {
        redisClient = new IORedis(process.env.REDIS_URL);
        redisLimiter = new RateLimiterRedis({
          storeClient: redisClient,
          points: parseInt(process.env.DEMO_RATE_LIMIT || '20', 10),
          duration: parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10),
          keyPrefix: 'rl_demo',
        });

        try {
          const res = await redisLimiter.consume(ip);
          return { ok: true, remaining: typeof res?.remainingPoints === 'number' ? res.remainingPoints : undefined };
        } catch (rej) {
          const sec = Math.ceil((rej?.msBeforeNext || 1000) / 1000) || 1;
          return { ok: false, retryAfter: sec, remaining: typeof rej?.remainingPoints === 'number' ? rej.remainingPoints : undefined };
        }
      }
    }

    // No Redis configured or optional packages not installed
    redisClient = null;
    redisLimiter = null;
    throw new Error('no-redis');
  } catch (e) {
    // Propagate reject-like shapes upward so caller can fallback
    if (e && typeof (e as any).msBeforeNext === 'number') {
      const sec = Math.ceil(((e as any).msBeforeNext || 1000) / 1000) || 1;
      return { ok: false, retryAfter: sec, remaining: typeof (e as any).remainingPoints === 'number' ? (e as any).remainingPoints : undefined };
    }
    throw e;
  }
}

export default { runtimeConsume };
