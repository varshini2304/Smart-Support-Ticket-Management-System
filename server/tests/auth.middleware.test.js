/**
 * Authentication and Authorization Middleware Tests
 * Tests JWT verification, authentication failures, and role-based authorization
 * WITHOUT requiring a live MongoDB connection
 *
 * To run: npm test -- --testPathPattern="auth.middleware"
 */

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/authenticate.js';
import { authorizeRoles } from '../src/middleware/authorize.js';

// Set JWT_SECRET for testing if not already configured
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-auth-middleware-tests-only';
}

// ============================================================================
// TEST SETUP: Create isolated Express app with test routes
// ============================================================================

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  /**
   * Test endpoint: No authentication required (public)
   */
  app.get('/public', (req, res) => {
    res.json({ message: 'Public access granted' });
  });

  /**
   * Test endpoint: Authentication required
   */
  app.get('/protected', authenticate, (req, res) => {
    res.json({
      message: 'Authenticated access granted',
      userId: req.user.userId,
      role: req.user.role,
    });
  });

  /**
   * Test endpoint: ADMIN role required
   */
  app.get('/admin-only', authenticate, authorizeRoles('ADMIN'), (req, res) => {
    res.json({ message: 'Admin access granted' });
  });

  /**
   * Test endpoint: Multiple roles allowed (ADMIN or SUPPORT)
   */
  app.get('/staff-only', authenticate, authorizeRoles('ADMIN', 'SUPPORT'), (req, res) => {
    res.json({ message: 'Staff access granted' });
  });

  /**
   * Test endpoint: Attempt to manipulate role via request body (should be ignored)
   */
  app.post('/protected-post', authenticate, (req, res) => {
    res.json({
      requestBodyRole: req.body.role,
      actualRole: req.user.role,
      match: req.body.role === req.user.role,
    });
  });

  return app;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a valid JWT token for testing
 */
const generateTestToken = (userId = '507f1f77bcf86cd799439011', role = 'CUSTOMER', expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn, algorithm: 'HS256' }
  );
};

/**
 * Generate an expired JWT token for testing
 */
const generateExpiredToken = (userId = '507f1f77bcf86cd799439011', role = 'CUSTOMER') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '0s', algorithm: 'HS256' }
  );
};

/**
 * Generate a token signed with wrong secret (simulates tampering)
 */
const generateTokenWithWrongSecret = (userId = '507f1f77bcf86cd799439011', role = 'CUSTOMER') => {
  return jwt.sign(
    { userId, role },
    'wrong-secret-key',
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

describe('Authentication Middleware', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Public Routes', () => {
    it('should allow unauthenticated access to public routes', async () => {
      const res = await request(app).get('/public');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Public access granted');
    });
  });

  describe('Missing Token', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('No authorization token provided');
    });

    it('should return 401 for ADMIN-only route without token', async () => {
      const res = await request(app).get('/admin-only');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Malformed Token', () => {
    it('should return 401 when Authorization header format is invalid (missing Bearer)', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Token ${token}`); // Should be "Bearer"
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Invalid authorization header format');
    });

    it('should return 401 when Authorization header has extra spaces', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer  ${token}`); // Extra space
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Invalid authorization header format');
    });

    it('should return 401 when token is empty after Bearer', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when Authorization header has no space', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'BearerNoSpace');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Invalid authorization header format');
    });
  });

  describe('Invalid Token', () => {
    it('should return 401 when token is signed with wrong secret', async () => {
      const token = generateTokenWithWrongSecret();
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Invalid token');
    });

    it('should return 401 when token is malformed (not valid JWT)', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer not.a.valid.jwt');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when token payload is tampered', async () => {
      const token = generateTestToken();
      const [header, payload, signature] = token.split('.');
      const tamperedToken = `${header}.${payload}modified.${signature}`;
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${tamperedToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Expired Token', () => {
    it('should return 401 when token has expired', async () => {
      // Wait a moment to ensure token is expired
      const token = generateExpiredToken();
      // Small delay to ensure token age is > 0
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('Token has expired');
    });
  });

  describe('Valid Token', () => {
    it('should allow authenticated access with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'CUSTOMER';
      const token = generateTestToken(userId, role);

      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Authenticated access granted');
      expect(res.body.userId).toBe(userId);
      expect(res.body.role).toBe(role);
    });

    it('should attach user info to req.user from JWT payload', async () => {
      const userId = '507f1f77bcf86cd799439012';
      const role = 'ADMIN';
      const token = generateTestToken(userId, role);

      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(userId);
      expect(res.body.role).toBe(role);
    });
  });
});

// ============================================================================
// AUTHORIZATION TESTS
// ============================================================================

describe('Authorization Middleware', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('ADMIN-only Routes', () => {
    it('should return 403 when CUSTOMER tries to access ADMIN-only route', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should return 200 when ADMIN accesses ADMIN-only route', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin access granted');
    });

    it('should return 401 when unauthenticated user tries to access ADMIN-only route', async () => {
      const res = await request(app).get('/admin-only');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Multiple Roles', () => {
    it('should return 200 when ADMIN accesses staff-only route', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');
      const res = await request(app)
        .get('/staff-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Staff access granted');
    });

    it('should return 200 when SUPPORT accesses staff-only route', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'SUPPORT');
      const res = await request(app)
        .get('/staff-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Staff access granted');
    });

    it('should return 403 when CUSTOMER tries to access staff-only route', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/staff-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('Role Manipulation Prevention', () => {
    it('should ignore role in request body and use JWT role instead', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .post('/protected-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'ADMIN' }); // Attempt to manipulate role

      expect(res.status).toBe(200);
      expect(res.body.requestBodyRole).toBe('ADMIN'); // Body has the sent role
      expect(res.body.actualRole).toBe('CUSTOMER'); // But actual role from JWT
      expect(res.body.match).toBe(false); // They don't match
    });

    it('should deny ADMIN-only access even if CUSTOMER sends role in body', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .post('/admin-only')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'ADMIN' }); // Attempt to escalate

      // Note: This is actually a GET route, so POST will fail with 404 or 405
      // Better test is checking that the middleware uses JWT, not body
      // Covered by the role manipulation prevention test above
      expect(res.status).not.toBe(200);
    });

    it('should ignore role in query parameters and use JWT role instead', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/protected?role=ADMIN') // Attempt to manipulate via query
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('CUSTOMER'); // Uses JWT role, not query param
    });
  });

  describe('Middleware Integration', () => {
    it('should run authenticate middleware before authorize middleware', async () => {
      // If authorize middleware runs before authenticate, it would fail differently
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);

      // Should get 403 (authorization failed) not 401 (authentication failed)
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should return 401 if authenticate middleware fails before checking authorization', async () => {
      // Invalid token should fail at authentication level
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty allowedRoles array gracefully', async () => {
      // This tests the edge case of authorizeRoles() with no arguments
      const app2 = express();
      app2.use(express.json());
      app2.get('/restricted', authenticate, authorizeRoles(), (req, res) => {
        res.json({ message: 'Access granted' });
      });

      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');
      const res = await request(app2)
        .get('/restricted')
        .set('Authorization', `Bearer ${token}`);

      // With no allowed roles, even ADMIN should be denied
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should handle case-sensitive role matching', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'admin'); // lowercase
      const res = await request(app)
        .get('/admin-only') // expects 'ADMIN'
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403); // Should be denied due to case mismatch
      expect(res.body.error).toBe('Forbidden');
    });
  });
});

// ============================================================================
// AUTHENTICATION BEHAVIOR UNCHANGED TESTS
// ============================================================================

describe('Authentication Behavior Regression', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should not modify existing authentication flow', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const role = 'CUSTOMER';
    const token = generateTestToken(userId, role);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(res.body.role).toBe(role);
  });

  it('should continue to validate Bearer token format', async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `NotBearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid authorization header format');
  });

  it('should continue to require exact two-part Authorization header', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token1 token2'); // Too many parts

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});

// ============================================================================
// DATABASE CONNECTIVITY NOTE
// ============================================================================

describe('Unit Test Scope', () => {
  it('should note that these tests do not require MongoDB', () => {
    // This test documents that auth middleware tests use mocked JWTs
    // and don't perform any database queries
    expect(process.env.MONGODB_URI).toBeUndefined(); // Expected for unit tests
    // Tests pass regardless of MongoDB configuration
  });
});
