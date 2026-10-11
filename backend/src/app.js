import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import bookRoutes from './routes/bookRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// REST API Routes
app.use('/api/books', bookRoutes);
app.use('/api/system', systemRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library Management API' });
});

// Centralized error handler
app.use(errorHandler);

export default app;
