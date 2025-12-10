import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client for caching and real-time features
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const url = process.env.REDIS_URL || "redis://localhost:6379";

  redisClient = createClient({
    url: url,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await redisClient.connect();
  console.log("✅ Redis connected");

  return redisClient;
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
}

/**
 * Cache helper - Set with TTL
 */
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = 3600
): Promise<void> {
  const client = await getRedisClient();
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

/**
 * Cache helper - Get
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

/**
 * Cache helper - Delete
 */
export async function deleteCache(key: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(key);
}

/**
 * Cache user data (profile, preferences)
 */
export async function cacheUserData(
  userId: string,
  data: unknown
): Promise<void> {
  await setCache(`user:${userId}`, data, 3600); // 1 hour
}

/**
 * Get cached user data
 */
export async function getUserCache<T>(userId: string): Promise<T | null> {
  return getCache<T>(`user:${userId}`);
}

/**
 * Cache generation results (AI outputs)
 */
export async function cacheGenerationResult(
  generationId: string,
  result: unknown
): Promise<void> {
  await setCache(`generation:${generationId}`, result, 86400); // 24 hours
}

/**
 * Get cached generation
 */
export async function getGenerationCache<T>(
  generationId: string
): Promise<T | null> {
  return getCache<T>(`generation:${generationId}`);
}

/**
 * Rate limiting - Check if user exceeded limit
 */
export async function checkRateLimit(
  userId: string,
  limit: number,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  const client = await getRedisClient();
  const key = `ratelimit:${userId}`;

  const current = await client.incr(key);

  if (current === 1) {
    await client.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, limit - current);
  return {
    allowed: current <= limit,
    remaining,
  };
}

/**
 * Store real-time notifications
 */
export async function addNotification(
  userId: string,
  notification: {
    id: string;
    title: string;
    message: string;
    timestamp: number;
  }
): Promise<void> {
  const client = await getRedisClient();
  const key = `notifications:${userId}`;

  // Store as sorted set (by timestamp)
  await client.zAdd(key, {
    score: notification.timestamp,
    value: JSON.stringify(notification),
  });

  // Keep only last 50 notifications
  await client.zRemRangeByRank(key, 0, -51);

  // Set TTL (30 days)
  await client.expire(key, 86400 * 30);
}

/**
 * Get user notifications
 */
export async function getNotifications(
  userId: string,
  limit: number = 20
): Promise<unknown[]> {
  const client = await getRedisClient();
  const key = `notifications:${userId}`;

  const notifications = await client.zRevRange(key, 0, limit - 1);
  return notifications.map((n) => JSON.parse(n));
}

/**
 * Real-time presence - track online users
 */
export async function setUserPresence(
  userId: string,
  data: unknown
): Promise<void> {
  const client = await getRedisClient();
  await client.setEx(`presence:${userId}`, 300, JSON.stringify(data)); // 5 min expiry
}

/**
 * Get online users
 */
export async function getOnlineUsers(): Promise<string[]> {
  const client = await getRedisClient();
  const keys = await client.keys("presence:*");
  return keys.map((k) => k.replace("presence:", ""));
}

/**
 * Session management
 */
export async function setSession(
  sessionId: string,
  userId: string,
  ttlSeconds: number = 86400
): Promise<void> {
  await setCache(`session:${sessionId}`, { userId }, ttlSeconds);
}

/**
 * Validate session
 */
export async function validateSession(
  sessionId: string
): Promise<{ userId: string } | null> {
  return getCache<{ userId: string }>(`session:${sessionId}`);
}

/**
 * Pub/Sub for real-time events
 */
export async function publishEvent(
  channel: string,
  data: unknown
): Promise<void> {
  const client = await getRedisClient();
  await client.publish(channel, JSON.stringify(data));
}

/**
 * Subscribe to events
 */
export async function subscribeToEvents(
  channel: string,
  callback: (data: unknown) => void
): Promise<void> {
  const client = await getRedisClient();

  // Create subscriber client
  const subscriber = client.duplicate();
  await subscriber.connect();

  subscriber.subscribe(channel, (message) => {
    callback(JSON.parse(message));
  });
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default redisClient;
