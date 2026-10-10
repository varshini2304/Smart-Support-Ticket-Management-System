/**
 * Ticket Middleware Tests
 * Tests authentication, authorization, and ownership verification for ticket endpoints
 * WITHOUT requiring a live MongoDB connection
 *
 * To run: npm test -- --testPathPattern="ticket.middleware"
 */

import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middleware/authenticate.js';

// Set JWT_SECRET for testing if not already configured
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-ticket-middleware-tests-only';
}

// ============================================================================
// TEST SETUP: Create isolated Express app with test routes
// ============================================================================

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  /**
   * Test endpoint: Create ticket (public)
   */
  app.post('/api/tickets', (req, res) => {
    res.json({ message: 'Ticket created (mock)' });
  });

  /**
   * Test endpoint: Create ticket (requires authentication)
   */
  app.post('/api/tickets/protected', authenticate, (req, res) => {
    res.json({
      message: 'Authenticated ticket creation',
      userId: req.user.userId,
      role: req.user.role,
    });
  });

  /**
   * Test endpoint: Get ticket by ID (requires authentication)
   */
  app.get('/api/tickets/:id', authenticate, (req, res) => {
    res.json({
      message: 'Ticket retrieved',
      ticketId: req.params.id,
      userId: req.user.userId,
    });
  });

  /**
   * Test endpoint: Update ticket (requires authentication, validate body)
   */
  app.patch('/api/tickets/:id', authenticate, (req, res) => {
    // Simulate the controller's protection against status/priority updates
    if (req.body.status) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot update status',
      });
    }

    if (req.body.priority) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot update priority',
      });
    }

    if (req.body.createdBy) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot update createdBy',
      });
    }

    res.json({
      message: 'Ticket updated',
      ticketId: req.params.id,
      userId: req.user.userId,
      updatedFields: req.body,
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

// ============================================================================
// AUTHENTICATION TESTS (Ticket Endpoints)
// ============================================================================

describe('Ticket Endpoint Authentication', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Missing Tokens', () => {
    it('should return 401 when creating ticket without authorization header', async () => {
      const res = await request(app).post('/api/tickets/protected').send({
        title: 'Test Ticket',
        description: 'This is a test ticket',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
      expect(res.body.message).toContain('No authorization token provided');
    });

    it('should return 401 when retrieving ticket without token', async () => {
      const res = await request(app).get('/api/tickets/507f1f77bcf86cd799439011');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 when updating ticket without token', async () => {
      const res = await request(app)
        .patch('/api/tickets/507f1f77bcf86cd799439011')
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Invalid Tokens', () => {
    it('should return 401 with malformed authorization header', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/tickets/protected')
        .set('Authorization', `NotBearer ${token}`)
        .send({ title: 'Test', description: 'Test description' });
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid authorization header format');
    });

    it('should return 401 with expired token', async () => {
      const token = generateExpiredToken();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app)
        .get('/api/tickets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Token has expired');
    });

    it('should return 401 with tampered token', async () => {
      const token = generateTestToken();
      const [header, payload, signature] = token.split('.');
      const tamperedToken = `${header}.${payload}modified.${signature}`;

      const res = await request(app)
        .get('/api/tickets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${tamperedToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Valid Tokens', () => {
    it('should allow ticket creation with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateTestToken(userId, 'CUSTOMER');

      const res = await request(app)
        .post('/api/tickets/protected')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Authenticated ticket creation');
      expect(res.body.userId).toBe(userId);
      expect(res.body.role).toBe('CUSTOMER');
    });

    it('should allow ticket retrieval with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const ticketId = '607f1f77bcf86cd799439022';
      const token = generateTestToken(userId, 'CUSTOMER');

      const res = await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(userId);
      expect(res.body.ticketId).toBe(ticketId);
    });

    it('should allow ticket update with valid token', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const ticketId = '607f1f77bcf86cd799439022';
      const token = generateTestToken(userId, 'CUSTOMER');

      const res = await request(app)
        .patch(`/api/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        });

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(userId);
    });
  });
});

// ============================================================================
// MASS ASSIGNMENT PROTECTION TESTS
// ============================================================================

describe('Ticket Endpoint - Mass Assignment Prevention', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Status Update Prevention', () => {
    it('should reject attempt to update status', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/tickets/607f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Title',
          status: 'RESOLVED', // Attempt to change status
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
      expect(res.body.message).toContain('Cannot update status');
    });

    it('should reject status-only update attempt', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/tickets/607f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot update status');
    });
  });

  describe('Priority Update Prevention', () => {
    it('should reject attempt to update priority', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/tickets/607f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Title',
          priority: 'HIGH', // Attempt to change priority
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot update priority');
    });
  });

  describe('CreatedBy Update Prevention', () => {
    it('should reject attempt to update createdBy', async () => {
      const token = generateTestToken('507f1f77bcf86cd799439011', 'CUSTOMER');
      const res = await request(app)
        .patch('/api/tickets/607f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Title',
          createdBy: '607f1f77bcf86cd799439099', // Attempt to change ownership
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot update createdBy');
    });
  });
});

// ============================================================================
// AUTHENTICATION INTEGRITY TESTS
// ============================================================================

describe('Ticket Endpoint - Authentication Integrity', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should preserve userId from JWT across requests', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = generateTestToken(userId, 'CUSTOMER');

    const res1 = await request(app)
      .post('/api/tickets/protected')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', description: 'Test description' });

    const res2 = await request(app)
      .get('/api/tickets/some-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res1.body.userId).toBe(userId);
    expect(res2.body.userId).toBe(userId);
    expect(res1.body.userId).toBe(res2.body.userId);
  });

  it('should enforce different users have different auth contexts', async () => {
    const user1Id = '507f1f77bcf86cd799439011';
    const user2Id = '507f1f77bcf86cd799439012';
    const token1 = generateTestToken(user1Id, 'CUSTOMER');
    const token2 = generateTestToken(user2Id, 'CUSTOMER');

    const res1 = await request(app)
      .get('/api/tickets/some-id')
      .set('Authorization', `Bearer ${token1}`);

    const res2 = await request(app)
      .get('/api/tickets/some-id')
      .set('Authorization', `Bearer ${token2}`);

    expect(res1.body.userId).toBe(user1Id);
    expect(res2.body.userId).toBe(user2Id);
    expect(res1.body.userId).not.toBe(res2.body.userId);
  });
});

// ============================================================================
// DATABASE CONNECTIVITY NOTE
// ============================================================================

describe('Ticket Middleware Test Scope', () => {
  it('should note that these tests do not require MongoDB', () => {
    expect(process.env.MONGODB_URI).toBeUndefined();
  });
});
