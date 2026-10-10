import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { isDBConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  // Skip verbose per-request HTTP logs during automated tests unless DEBUG is set
  if (process.env.NODE_ENV === 'test' && !process.env.DEBUG) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const msg = `HTTP ${req.method} ${req.originalUrl || req.url} ${status} (${duration}ms)`;
    if (status >= 500) {
      logger.error(msg);
    } else if (status >= 400) {
      logger.warn(msg);
    } else {
      logger.info(msg);
    }
  });

  next();
});

// Health check endpoint with database status
app.get('/api/health', (req, res) => {
  const dbConnected = isDBConnected();

  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Ticket routes (customer APIs)
app.use('/api/tickets', ticketRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Placeholder for future routes

// 404 handler
app.use((req, res) => {
  if (process.env.NODE_ENV !== 'test' || process.env.DEBUG) {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl || req.url}`);
  }
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl || req.url}: ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

export default app;
