/**
 * Admin Middleware Tests
 * Tests admin authorization and endpoint protection
 * WITHOUT requiring a live MongoDB connection
 *
 * To run: npm test -- --testPathPattern="admin.middleware"
 */

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/authenticate.js';
import { authorizeRoles } from '../src/middleware/authorize.js';

// Set JWT_SECRET for testing if not already configured
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-admin-middleware-tests-only';
}

// ============================================================================
// TEST SETUP: Create isolated Express app with test routes
// ============================================================================

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  /**
   * Test endpoint: Admin-only ticket listing (public)
   */
  app.get('/api/admin/tickets', (req, res) => {
    res.json({ message: 'Admin tickets (public)' });
  });

  /**
   * Test endpoint: Admin-only ticket listing (protected)
   */
  app.get('/api/admin/tickets/protected', authenticate, authorizeRoles('ADMIN'), (req, res) => {
    res.json({
      message: 'Admin tickets listing',
      userId: req.user.userId,
      role: req.user.role,
    });
  });

  /**
   * Test endpoint: Update ticket status (protected)
   */
  app.patch('/api/admin/tickets/:id', authenticate, authorizeRoles('ADMIN'), (req, res) => {
    res.json({
      message: 'Ticket updated',
      ticketId: req.params.id,
      role: req.user.role,
    });
  });

  /**
   * Test endpoint: Assign ticket (protected)
   */
  app.patch('/api/admin/tickets/:id/assign', authenticate, authorizeRoles('ADMIN'), (req, res) => {
    res.json({
      message: 'Ticket assigned',
      ticketId: req.params.id,
      assignedTo: req.body.assignedTo,
    });
  });

  /**
   * Test endpoint: Get statistics (protected)
   */
  app.get('/api/admin/stats', authenticate, authorizeRoles('ADMIN'), (req, res) => {
    res.json({
      message: 'Dashboard statistics',
      role: req.user.role,
    });
  });

  return app;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// ============================================================================
// ADMIN AUTHORIZATION TESTS
// ============================================================================

describe('Admin Endpoint Authorization', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('CUSTOMER Access to Admin Endpoints', () => {
    it('should return 403 when CUSTOMER tries to list admin tickets', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/api/admin/tickets/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should return 403 when CUSTOMER tries to update ticket', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/admin/tickets/607f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should return 403 when CUSTOMER tries to assign ticket', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/admin/tickets/607f1f77bcf86cd799439022/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: '507f1f77bcf86cd799439012' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should return 403 when CUSTOMER tries to get statistics', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('ADMIN Access to Admin Endpoints', () => {
    it('should return 200 when ADMIN lists tickets', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateTestToken(userId, 'ADMIN');

      const res = await request(app)
        .get('/api/admin/tickets/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin tickets listing');
      expect(res.body.userId).toBe(userId);
      expect(res.body.role).toBe('ADMIN');
    });

    it('should return 200 when ADMIN updates ticket', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');
      const ticketId = '607f1f77bcf86cd799439022';

      const res = await request(app)
        .patch(`/api/admin/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Ticket updated');
      expect(res.body.ticketId).toBe(ticketId);
    });

    it('should return 200 when ADMIN assigns ticket', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');
      const ticketId = '607f1f77bcf86cd799439022';
      const assigneeId = '507f1f77bcf86cd799439012';

      const res = await request(app)
        .patch(`/api/admin/tickets/${ticketId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedTo: assigneeId });

      expect(res.status).toBe(200);
      expect(res.body.assignedTo).toBe(assigneeId);
    });

    it('should return 200 when ADMIN gets statistics', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'ADMIN');

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('ADMIN');
    });
  });

  describe('Unauthenticated Access to Admin Endpoints', () => {
    it('should return 401 when accessing admin tickets without token', async () => {
      const res = await request(app).get('/api/admin/tickets/protected');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when updating ticket without token', async () => {
      const res = await request(app)
        .patch('/api/admin/tickets/607f1f77bcf86cd799439022')
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when assigning ticket without token', async () => {
      const res = await request(app)
        .patch('/api/admin/tickets/607f1f77bcf86cd799439022/assign')
        .send({ assignedTo: '507f1f77bcf86cd799439012' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when getting statistics without token', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Invalid Token to Admin Endpoints', () => {
    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: 'ADMIN' },
        process.env.JWT_SECRET,
        { expiresIn: '0s', algorithm: 'HS256' }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app)
        .get('/api/admin/tickets/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Token has expired');
    });

    it('should return 401 with malformed token', async () => {
      const res = await request(app)
        .get('/api/admin/tickets/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
});

// ============================================================================
// MIDDLEWARE CHAIN INTEGRITY TESTS
// ============================================================================

describe('Admin Middleware Chain', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should enforce authentication before authorization', async () => {
    // Missing token should return 401, not 403
    const res = await request(app)
      .get('/api/admin/tickets/protected');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should verify role after successful authentication', async () => {
    // Authenticated as CUSTOMER should get 403
    const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
    const res = await request(app)
      .get('/api/admin/tickets/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('should attach correct user context for ADMIN requests', async () => {
    const userId = '607f1f77bcf86cd799439099';
    const token = generateTestToken(userId, 'ADMIN');

    const res = await request(app)
      .get('/api/admin/tickets/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(res.body.role).toBe('ADMIN');
  });
});

// ============================================================================
// DATABASE CONNECTIVITY NOTE
// ============================================================================

describe('Admin Middleware Test Scope', () => {
  it('should note that these tests do not require MongoDB', () => {
    expect(process.env.MONGODB_URI).toBeUndefined();
  });
});
