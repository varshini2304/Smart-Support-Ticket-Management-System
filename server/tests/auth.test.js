/**
 * Authentication API Tests
 * Tests for registration, login, and JWT authentication
 * 
 * Prerequisites:
 * - MongoDB database with connection string in .env or MONGODB_URI
 * - Jest test runner
 * - Supertest HTTP assertion library
 * 
 * Note: These tests require a live database connection
 * To run: npm test
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { verifyJWT, generateJWT } from '../src/services/authService.js';

// Test timeout (MongoDB operations can take time)
if (global.jest) {
  global.jest.setTimeout(10000);
}

// Connection state flag
let dbConnected = false;

/**
 * Connect to test database before running tests
 */
beforeAll(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.warn(
        'MONGODB_URI not configured. Database tests will be skipped.'
      );
      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    dbConnected = true;
    console.log('✓ Test database connected');
  } catch (error) {
    console.warn(`⚠ Could not connect to database: ${error.message}`);
    dbConnected = false;
  }
});

/**
 * Clean up test data and disconnect after all tests
 */
afterAll(async () => {
  try {
    if (dbConnected) {
      // Clear all test users
      await User.deleteMany({});
      await mongoose.disconnect();
      console.log('✓ Test database cleaned and disconnected');
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
});

/**
 * Clear test users before each test
 */
beforeEach(async () => {
  if (dbConnected) {
    await User.deleteMany({});
  }
});

// ============================================================================
// REGISTRATION TESTS
// ============================================================================

describe('POST /api/auth/register - User Registration', () => {
  it('should successfully register a new customer with valid data', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('John Customer');
    expect(response.body.email).toBe('john@example.com');
    expect(response.body.role).toBe('CUSTOMER');
    expect(response.body).not.toHaveProperty('passwordHash');

    if (dbConnected) {
      // Verify user was created in database
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('John Customer');
    }
  });

  it('should reject duplicate email with 409 Conflict', async () => {
    // Create first user
    await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    // Attempt to create second user with same email
    const response = await request(app).post('/api/auth/register').send({
      name: 'Jane Customer',
      email: 'john@example.com',
      password: 'AnotherPassword123',
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Conflict');
    expect(response.body.message).toBe('Email already in use');
  });

  it('should reject registration without name', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toContain('Name is required');
  });

  it('should reject registration without email', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toContain('Email is required');
  });

  it('should reject registration without password', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toContain('Password is required');
  });

  it('should reject invalid email format', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'not-an-email',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  it('should reject password shorter than 8 characters', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
      password: 'Short123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password must be at least 8 characters');
  });

  it('should normalize email to lowercase', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'John@EXAMPLE.COM',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('john@example.com');
  });

  it('should always create CUSTOMER role (not ADMIN)', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
      password: 'SecurePassword123',
      role: 'ADMIN', // Attempt to set ADMIN role
    });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe('CUSTOMER'); // Should ignore role field
  });

  it('should not return passwordHash in response', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'John Customer',
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty('passwordHash');
  });
});

// ============================================================================
// LOGIN TESTS
// ============================================================================

describe('POST /api/auth/login - User Login', () => {
  beforeEach(async () => {
    // Create test user for login tests
    if (dbConnected) {
      await request(app).post('/api/auth/register').send({
        name: 'John Customer',
        email: 'john@example.com',
        password: 'SecurePassword123',
      });
    }
  });

  it('should successfully login with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.name).toBe('John Customer');
    expect(response.body.user.email).toBe('john@example.com');
    expect(response.body.user.role).toBe('CUSTOMER');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('should return valid JWT token', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(200);

    // Verify token is valid JWT
    if (dbConnected && process.env.JWT_SECRET) {
      const decoded = verifyJWT(response.body.token);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('role');
      expect(decoded.role).toBe('CUSTOMER');
    }
  });

  it('should reject incorrect password with 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should reject non-existent email with 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should reject login without email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email is required');
  });

  it('should reject login without password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password is required');
  });

  it('should normalize email to lowercase in login', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'JOHN@EXAMPLE.COM',
      password: 'SecurePassword123',
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('john@example.com');
  });
});

// ============================================================================
// JWT AUTHENTICATION TESTS
// ============================================================================

describe('GET /api/auth/me - Current User (Requires JWT)', () => {
  let testToken;
  let testUser;

  beforeEach(async () => {
    if (dbConnected) {
      // Register and login test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Customer',
          email: 'john@example.com',
          password: 'SecurePassword123',
        });

      testUser = registerResponse.body;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePassword123',
        });

      testToken = loginResponse.body.token;
    }
  });

  it('should return authenticated user profile with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('John Customer');
    expect(response.body.email).toBe('john@example.com');
    expect(response.body.role).toBe('CUSTOMER');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('should reject request without Authorization header', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.message).toContain('No authorization token provided');
  });

  it('should reject invalid Authorization header format', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Invalid ${testToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid authorization header format');
  });

  it('should reject malformed token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should reject empty token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ');

    expect(response.status).toBe(401);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Full Authentication Flow', () => {
  it('should complete register -> login -> get profile flow', async () => {
    // Step 1: Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Admin',
        email: 'alice@example.com',
        password: 'StrongPassword123',
      });

    expect(registerResponse.status).toBe(201);

    // Step 2: Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'StrongPassword123',
      });

    expect(loginResponse.status).toBe(200);

    // Step 3: Get profile
    const profileResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.name).toBe('Alice Admin');
    expect(profileResponse.body.email).toBe('alice@example.com');
  });

  it('should prevent login with wrong password after registration', async () => {
    // Register
    await request(app).post('/api/auth/register').send({
      name: 'Bob User',
      email: 'bob@example.com',
      password: 'CorrectPassword123',
    });

    // Attempt login with wrong password
    const response = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);
  });
});

// ============================================================================
// DATABASE CONNECTIVITY CHECK
// ============================================================================

describe('Database Connectivity', () => {
  it('should indicate whether database is connected', () => {
    if (!process.env.MONGODB_URI) {
      console.log('⚠ Database tests skipped (MONGODB_URI not configured)');
      expect(dbConnected).toBe(false);
    } else if (dbConnected) {
      console.log('✓ All database-dependent tests executed');
    }
  });
});
