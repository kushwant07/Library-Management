import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { Member } from '../models/Member.js';
import { redis } from '../config/redis.js';
import { getActiveCacheKeys, invalidateBooksCache } from '../services/cacheService.js';

/**
 * Get simple statistics for Dashboard
 * - Total books count
 * - Available books count (sum of available copies)
 * - Total members count
 * - Database health statuses
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalBooks, totalMembers, books] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Book.find({}, 'availableCopies').lean(),
    ]);

    const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

    const redisConnected = redis.status === 'ready';
    const mongoConnected = mongoose.connection.readyState === 1;

    return res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        availableCopies,
        totalMembers,
        mongoConnected,
        redisConnected,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Redis cache status and active keys (for Database Demo page)
 */
export const getCacheInfo = async (req, res, next) => {
  try {
    const keys = await getActiveCacheKeys();
    const redisConnected = redis.status === 'ready';

    return res.status(200).json({
      success: true,
      redisConnected,
      keysCount: keys.length,
      keys,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Flush Redis cache on demand for student demo
 */
export const clearCache = async (req, res, next) => {
  try {
    const deletedCount = await invalidateBooksCache();

    return res.status(200).json({
      success: true,
      message: `Redis cache cleared! Deleted ${deletedCount} key(s). Subsequent queries will fetch from MongoDB.`,
      deletedCount,
    });
  } catch (err) {
    next(err);
  }
};
