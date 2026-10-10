import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new customer account
 * Body: { name, email, password }
 * Response: 201 Created - New user object (without passwordHash)
 * Response: 400 Bad Request - Validation error
 * Response: 409 Conflict - Email already in use
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 * Response: 200 OK - { token, user }
 * Response: 400 Bad Request - Validation error
 * Response: 401 Unauthorized - Invalid credentials
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get authenticated user's profile
 * Headers: Authorization: Bearer <token>
 * Response: 200 OK - User object (without passwordHash)
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 404 Not Found - User no longer exists
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * PATCH /api/auth/profile
 * Update authenticated user's profile
 * Headers: Authorization: Bearer <token>
 * Body: { name }
 * Response: 200 OK - Updated user object (without passwordHash)
 * Response: 400 Bad Request - Validation error
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 404 Not Found - User no longer exists
 */
router.patch('/profile', authenticate, updateProfile);

export default router;
