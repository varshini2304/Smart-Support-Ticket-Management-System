import logger from '../utils/logger.js';

/**
 * Role-based authorization middleware factory
 * Returns middleware that checks if authenticated user has required role
 * Must be used AFTER authenticate middleware
 *
 * Usage:
 *   app.delete('/api/users/:id', authenticate, authorizeRoles('ADMIN'), deleteUser)
 *
 * Returns:
 *   401 Unauthorized - if authenticate middleware didn't run (no req.user)
 *   403 Forbidden - if user lacks required role
 *   next() - if user has required role
 */

/**
 * Create authorization middleware for specified roles
 * @param {...string} allowedRoles - One or more role names (e.g., 'ADMIN', 'SUPPORT')
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const endpoint = req.originalUrl || req.url;

    // Check if user was authenticated by previous middleware
    if (!req.user) {
      logger.auth.authDenied('Authentication required before role authorization check', endpoint, req.method);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Extract user role from JWT payload (trusted source)
    const userRole = req.user.role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      logger.auth.forbidden(req.user.userId, userRole, allowedRoles, endpoint, req.method);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions for this resource',
      });
    }

    // User has required role, proceed
    next();
  };
};

export default authorizeRoles;
