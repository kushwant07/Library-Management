import express from 'express';
import { getDashboardStats, getCacheInfo, clearCache } from '../controllers/systemController.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/cache-info', getCacheInfo);
router.post('/clear-cache', clearCache);

export default router;
