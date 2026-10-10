/**
 * Customer ticket routes
 * All routes require authentication
 * Customers can only access their own tickets
 */

import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicket,
  updateTicket,
} from '../controllers/ticketController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

/**
 * POST /api/tickets
 * Create a new ticket for the authenticated customer
 * Body: { title, description, priority? }
 * Response: 201 Created - New ticket object
 * Response: 400 Bad Request - Validation error
 * Response: 401 Unauthorized - No token or invalid token
 */
router.post('/', authenticate, createTicket);

/**
 * GET /api/tickets
 * List all tickets for the authenticated customer
 * Query params: page=1, limit=10
 * Response: 200 OK - { tickets: [], total, page, pages }
 * Response: 401 Unauthorized - No token or invalid token
 */
router.get('/', authenticate, getMyTickets);

/**
 * GET /api/tickets/:id
 * Retrieve a specific ticket by ID
 * Only accessible if ticket belongs to authenticated customer
 * Response: 200 OK - Ticket object
 * Response: 404 Not Found - Ticket doesn't exist or not owned by customer
 * Response: 401 Unauthorized - No token or invalid token
 */
router.get('/:id', authenticate, getTicket);

/**
 * PATCH /api/tickets/:id
 * Update a ticket (only title and description allowed)
 * Body: { title?, description? }
 * Customers cannot update: status, priority, createdBy, assignment
 * Response: 200 OK - Updated ticket object
 * Response: 400 Bad Request - Validation error or attempt to update protected fields
 * Response: 404 Not Found - Ticket doesn't exist or not owned by customer
 * Response: 401 Unauthorized - No token or invalid token
 */
router.patch('/:id', authenticate, updateTicket);

export default router;
