import { verifyJWT } from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify JWT and load authenticated user
 * Attaches user info to req.user if authentication succeeds
 * Returns 401 if token is missing, invalid, or expired
 *
 * Usage: app.use('/protected', authenticate, handler)
 */
export const authenticate = (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  const endpoint = req.originalUrl || req.url;

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader) {
      logger.auth.authDenied('No authorization token provided', endpoint, req.method, clientIp);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided',
      });
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.auth.authDenied('Invalid authorization header format', endpoint, req.method, clientIp);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format',
      });
    }

    const token = parts[1];

    // Verify and decode JWT
    const decoded = verifyJWT(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.message.includes('Token has expired')) {
      logger.auth.authDenied('Token has expired', endpoint, req.method, clientIp);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
      });
    }

    if (error.message.includes('Invalid token')) {
      logger.auth.authDenied('Invalid token', endpoint, req.method, clientIp);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    // Handle other JWT errors
    logger.auth.authDenied(`Authentication failed: ${error.message}`, endpoint, req.method, clientIp);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

export default authenticate;

