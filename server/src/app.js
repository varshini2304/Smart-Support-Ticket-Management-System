import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { isDBConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist.',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
});

export default app;
