import {
  createUser,
  authenticateUser,
  generateJWT,
  getUserById,
  updateUserProfile,
} from '../services/authService.js';
import {
  validateRegistration,
  validateLogin,
} from '../validators/authValidators.js';
import logger from '../utils/logger.js';

/**
 * Register a new customer user
 * POST /api/auth/register
 *
 * @param {object} req - Express request
 * @param {object} req.body - { name, email, password }
 * @param {object} res - Express response
 */
export const register = async (req, res, next) => {
  const { name, email, password } = req.body || {};
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

  try {
    // Validate registration data
    const validation = validateRegistration({ name, email, password });
    if (!validation.valid) {
      logger.auth.registerFailure(email, `Validation error: ${validation.error}`, clientIp);
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Create user (throws error if email already exists)
    const user = await createUser(name, email, password);

    logger.auth.registerSuccess(user.email, user.role, user.id);

    // Return created user (201 Created)
    res.status(201).json(user);
  } catch (error) {
    // Check for duplicate email error
    if (error.message.includes('Email already in use')) {
      logger.auth.registerFailure(email, 'Conflict: Email already in use', clientIp);
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already in use',
      });
    }

    logger.error(`[AUTH] Registration unexpected error for "${email || 'unknown'}": ${error.message}`);
    // Pass other errors to error handler
    next(error);
  }
};

/**
 * Login user and return JWT token
 * POST /api/auth/login
 *
 * @param {object} req - Express request
 * @param {object} req.body - { email, password }
 * @param {object} res - Express response
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body || {};
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;

  try {
    // Validate login data
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      logger.auth.loginFailure(email, `Validation error: ${validation.error}`, clientIp);
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);

    // Generate JWT token
    const token = generateJWT(user);

    logger.auth.loginSuccess(user.email, user.role, user.id);

    // Return token and user (200 OK)
    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    // Check for authentication error
    if (error.message.includes('Invalid email or password')) {
      logger.auth.loginFailure(email, 'Invalid email or password', clientIp);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    logger.error(`[AUTH] Login unexpected error for "${email || 'unknown'}": ${error.message}`);
    // Pass other errors to error handler
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 *
 * This endpoint requires authentication middleware to attach req.user
 *
 * @param {object} req - Express request
 * @param {object} req.user - Authenticated user object (from middleware)
 * @param {object} res - Express response
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // Authentication middleware ensures req.user exists
    if (!req.user) {
      logger.warn('[AUTH] Fetch current user failed: No user object attached to request');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Fetch fresh user data from database
    const user = await getUserById(req.user.userId);

    if (!user) {
      logger.warn(`[AUTH] Fetch current user failed: User ${req.user.userId} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Return user (without passwordHash via toJSON)
    res.status(200).json(user.toJSON());
  } catch (error) {
    logger.error(`[AUTH] Fetch current user unexpected error: ${error.message}`);
    next(error);
  }
};

/**
 * Update current authenticated user's profile
 * PATCH /api/auth/profile
 *
 * This endpoint requires authentication middleware to attach req.user
 *
 * @param {object} req - Express request
 * @param {object} req.user - Authenticated user object (from middleware)
 * @param {object} req.body - { name }
 * @param {object} res - Express response
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Authentication middleware ensures req.user exists
    if (!req.user) {
      logger.warn('[AUTH] Profile update failed: User not authenticated');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { name } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        logger.warn(`[AUTH] Profile update validation failed for user ${req.user.userId}: Name cannot be empty`);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name cannot be empty',
        });
      }
      if (name.trim().length > 100) {
        logger.warn(`[AUTH] Profile update validation failed for user ${req.user.userId}: Name exceeds 100 characters`);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name must not exceed 100 characters',
        });
      }
    }

    // Update user profile
    const updatedUser = await updateUserProfile(req.user.userId, { name });
    logger.info(`[AUTH] Profile updated successfully for user ${req.user.userId} (${updatedUser.email})`);

    // Return updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.message.includes('User not found')) {
      logger.warn(`[AUTH] Profile update failed: User ${req.user?.userId} not found`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    logger.error(`[AUTH] Profile update unexpected error for user ${req.user?.userId}: ${error.message}`);
    next(error);
  }
};
