import { redis } from '../config/redis.js';

// Cache expiration time in seconds (2 minutes)
const CACHE_TTL = 120;

/**
 * Build a readable Redis key based on search query
 * Example: "books:list:all" or "books:list:search:gatsby"
 */
export const buildCacheKey = (search = '') => {
  const cleanSearch = search.trim().toLowerCase();
  return cleanSearch ? `books:list:search:${cleanSearch}` : 'books:list:all';
};

/**
 * Get data from Redis cache
 * Returns parsed object or null if cache miss
 */
export const getCachedData = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Redis] Cache read error for "${key}":`, err.message);
    return null; // Graceful fallback to MongoDB on error
  }
};

/**
 * Save data into Redis cache with TTL
 */
export const setCachedData = async (key, data, ttlSeconds = CACHE_TTL) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(`[Redis] Cache write error for "${key}":`, err.message);
  }
};

/**
 * Invalidate all book-related cache keys in Redis
 * Called whenever a book is Created, Updated, or Deleted
 */
export const invalidateBooksCache = async () => {
  try {
    const keys = await redis.keys('books:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Invalidated ${keys.length} cached key(s):`, keys);
    }
    return keys.length;
  } catch (err) {
    console.warn('[Redis] Cache invalidation error:', err.message);
    return 0;
  }
};

/**
 * Get all active cache keys (used in the Database Demo page)
 */
export const getActiveCacheKeys = async () => {
  try {
    return await redis.keys('books:*');
  } catch (err) {
    return [];
  }
};
