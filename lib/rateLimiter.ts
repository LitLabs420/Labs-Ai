// Optional Redis-backed rate limiter. If REDIS_URL is set, uses Redis for global limits.
// Falls back to in-memory limiter when REDIS_URL is not provided.

// Minimal constructor shapes used for runtime normalization. Kept narrow so
// TypeScript doesn't require the optional packages to be installed.
type IORedisConstructor = new (uri: string) => unknown;
type RedisLimiterLike = { consume: (key: string) => Promise<{ remainingPoints?: number; msBeforeNext?: number; remaining?: number }>; };
type RateLimiterRedisConstructor = new (opts: { storeClient: unknown; points?: number; duration?: number; keyPrefix?: string }) => RedisLimiterLike;

// Runtime loader function type returned by the runtime-only file.
type RuntimeConsumeResult = { ok: true; remaining?: number } | { ok: false; retryAfter?: number; remaining?: number };

let runtimeConsume: ((ip: string) => Promise<RuntimeConsumeResult>) | null = null;

async function ensureRuntimeLoader() {
  if (runtimeConsume) return;
  try {
    const runtime = await import('./rateLimiter.runtime');
    runtimeConsume = runtime?.runtimeConsume ?? null;
  } catch (e) {
    runtimeConsume = null;
  }
}

// In-memory token bucket for per-instance limits
const inMemoryMap = new Map<string, { count: number; start: number }>();
const DEFAULT_WINDOW_SEC = parseInt(process.env.DEMO_RATE_LIMIT_WINDOW || '60', 10);
const DEFAULT_DEMO_RATE_LIMIT = parseInt(process.env.DEMO_RATE_LIMIT || '20', 10);
const WINDOW_MS = DEFAULT_WINDOW_SEC * 1000;
const MAX_PER_WINDOW = DEFAULT_DEMO_RATE_LIMIT;

export async function checkRateLimit(ip: string) {
  await ensureRuntimeLoader();

  if (runtimeConsume) {
    try {
      const res = await runtimeConsume(ip);
      if (res.ok === true) return { ok: true, remaining: res.remaining };
      return { ok: false, retryAfter: res.retryAfter };
    } catch (e) {
      // fall through to in-memory fallback
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
