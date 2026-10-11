import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

/**
 * Singleton Redis client instance
 * Used for caching, temporary reservation locks, and search analytics
 */
export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log(`[Redis] Connected successfully to ${redisConfig.host}:${redisConfig.port}`);
});

redis.on('error', (err) => {
  console.error(`[Redis] Connection error: ${err.message}`);
});

redis.on('ready', () => {
  console.log('[Redis] Ready to accept commands');
});

/**
 * Health check helper for Redis
 */
export const getRedisStatus = async () => {
  try {
    const ping = await redis.ping();
    const info = await redis.info('memory');
    const usedMemoryMatch = info.match(/used_memory_human:(.*)/);
    const usedMemory = usedMemoryMatch ? usedMemoryMatch[1].trim() : 'N/A';

    return {
      connected: ping === 'PONG',
      status: redis.status,
      usedMemory,
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      error: error.message,
    };
  }
};
