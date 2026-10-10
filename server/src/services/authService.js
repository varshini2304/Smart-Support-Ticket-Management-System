import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Hash a plaintext password using bcrypt
 * @param {string} password - Plaintext password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Verify a plaintext password against a hash
 * @param {string} password - Plaintext password to verify
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} True if passwords match
 * @throws {Error} If comparison fails
 */
export const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
};

/**
 * Generate a JWT token for a user
 * @param {object} user - User object with _id and role
 * @returns {string} Signed JWT token
 * @throws {Error} If JWT_SECRET is not set or token generation fails
 */
export const generateJWT = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not configured. ' +
      'Please set JWT_SECRET in your .env file.'
    );
  }

  try {
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      secret,
      {
        expiresIn: '7d', // Token valid for 7 days
        algorithm: 'HS256',
      }
    );

    return token;
  } catch (error) {
    throw new Error(`JWT generation failed: ${error.message}`);
  }
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload { userId, role, iat, exp }
 * @throws {Error} If token is invalid, expired, or JWT_SECRET is not set
 */
export const verifyJWT = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not configured. ' +
      'Please set JWT_SECRET in your .env file.'
    );
  }

  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not yet valid');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Create a new user with hashed password
 * @param {string} name - User's name
 * @param {string} email - User's email (will be normalized)
 * @param {string} password - Plaintext password (will be hashed)
 * @returns {Promise<object>} Created user document (without passwordHash)
 * @throws {Error} If user creation fails or email already exists
 */
export const createUser = async (name, email, password) => {
  try {
    // Hash password before storing
    const passwordHash = await hashPassword(password);

    // Create new user with hashed password
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'CUSTOMER', // Always create CUSTOMER from public registration
    });

    await user.save();

    // Return user without passwordHash
    return user.toJSON();
  } catch (error) {
    // Handle duplicate email (unique constraint violation)
    if (error.code === 11000 && error.keyPattern.email) {
      throw new Error('Email already in use');
    }

    throw error;
  }
};

/**
 * Get a user by email
 * @param {string} email - User's email
 * @returns {Promise<object|null>} User document or null if not found
 * @throws {Error} If database query fails
 */
export const getUserByEmail = async (email) => {
  try {
    // Use select('+passwordHash') to include passwordHash for authentication
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+passwordHash');

    return user;
  } catch (error) {
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
};

/**
 * Get a user by ID
 * @param {string} userId - User's MongoDB ID
 * @returns {Promise<object|null>} User document or null if not found
 * @throws {Error} If database query fails
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error(`Failed to retrieve user: ${error.message}`);
  }
};

/**
 * Authenticate a user with email and password
 * @param {string} email - User's email
 * @param {string} password - Plaintext password
 * @returns {Promise<object>} Authenticated user document (without passwordHash)
 * @throws {Error} If credentials are invalid
 */
export const authenticateUser = async (email, password) => {
  try {
    // Retrieve user with passwordHash included
    const user = await getUserByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.passwordHash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // Return user without passwordHash
    return user.toJSON();
  } catch (error) {
    // Re-throw with consistent message (don't reveal if email exists)
    if (error.message.includes('verification failed')) {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
};

/**
 * Update user profile (name only)
 * @param {string} userId - User's MongoDB ID
 * @param {object} updates - Object containing fields to update
 * @param {string} updates.name - User's new name
 * @returns {Promise<object>} Updated user document (without passwordHash)
 * @throws {Error} If update fails or user not found
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    // Only allow updating name field
    const allowedUpdates = {};
    if (updates.name !== undefined) {
      allowedUpdates.name = updates.name.trim();
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Return updated user without passwordHash
    return user.toJSON();
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};
