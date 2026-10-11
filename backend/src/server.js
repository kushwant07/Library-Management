import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import './config/redis.js'; // Initializes Redis connection listeners

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (Source of Truth)
    await connectDB();

    // 2. Start HTTP listener
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Library Management Backend running on port ${PORT}`);
      console.log(`📚 MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_management'}`);
      console.log(`⚡ Redis: ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
};

startServer();
