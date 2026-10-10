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

/**
 * Register a new customer user
 * POST /api/auth/register
 *
 * @param {object} req - Express request
 * @param {object} req.body - { name, email, password }
 * @param {object} res - Express response
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate registration data
    const validation = validateRegistration({ name, email, password });
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Create user (throws error if email already exists)
    const user = await createUser(name, email, password);

    // Return created user (201 Created)
    res.status(201).json(user);
  } catch (error) {
    // Check for duplicate email error
    if (error.message.includes('Email already in use')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already in use',
      });
    }

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
  try {
    const { email, password } = req.body;

    // Validate login data
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Authenticate user
    const user = await authenticateUser(email, password);

    // Generate JWT token
    const token = generateJWT(user);

    // Return token and user (200 OK)
    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    // Check for authentication error
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

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
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Fetch fresh user data from database
    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Return user (without passwordHash via toJSON)
    res.status(200).json(user.toJSON());
  } catch (error) {
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
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const { name } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name cannot be empty',
        });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name must not exceed 100 characters',
        });
      }
    }

    // Update user profile
    const updatedUser = await updateUserProfile(req.user.userId, { name });

    // Return updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.message.includes('User not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }
    next(error);
  }
};
