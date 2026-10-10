/**
 * Admin ticket routes
 * All routes require authentication and ADMIN role
 */

import express from 'express';
import {
  getAllTicketsAdmin,
  getTicketAdmin,
  updateTicketStatusPriority,
  resolveTicket,
  assignTicket,
  getDashboardStatistics,
} from '../controllers/adminTicketController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();

/**
 * GET /api/admin/tickets
 * List all tickets with optional filtering
 * Query params: page=1, limit=10, status=?, priority=?
 * Response: 200 OK - { tickets: [], total, page, pages }
 * Response: 400 Bad Request - Invalid pagination or filter parameters
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.get('/tickets', authenticate, authorizeRoles('ADMIN'), getAllTicketsAdmin);

/**
 * GET /api/admin/tickets/:id
 * Retrieve a specific ticket by ID for admin inspection
 * Response: 200 OK - Ticket object
 * Response: 404 Not Found - Ticket not found
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.get('/tickets/:id', authenticate, authorizeRoles('ADMIN'), getTicketAdmin);

/**
 * PATCH /api/admin/tickets/:id
 * Update ticket status and/or priority
 * Body: { status?, priority?, resolutionNote? }
 * Response: 200 OK - Updated ticket object
 * Response: 400 Bad Request - Validation error or invalid fields
 * Response: 404 Not Found - Ticket not found
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.patch('/tickets/:id', authenticate, authorizeRoles('ADMIN'), updateTicketStatusPriority);

/**
 * PATCH /api/admin/tickets/:id/resolve
 * Resolve a ticket with a resolution note
 * Body: { resolutionNote }
 * Response: 200 OK - { message, ticket }
 * Response: 400 Bad Request - Missing or invalid resolution note
 * Response: 404 Not Found - Ticket not found
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.patch('/tickets/:id/resolve', authenticate, authorizeRoles('ADMIN'), resolveTicket);

/**
 * PATCH /api/admin/tickets/:id/assign
 * Assign ticket to a user
 * Body: { assignedTo: userId }
 * Response: 200 OK - Updated ticket object with assignment
 * Response: 400 Bad Request - Invalid assignee ID or user not found
 * Response: 404 Not Found - Ticket not found
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.patch('/tickets/:id/assign', authenticate, authorizeRoles('ADMIN'), assignTicket);

/**
 * GET /api/admin/stats
 * Get dashboard statistics about tickets
 * Response: 200 OK - { total, byStatus: {...}, byPriority: {...}, assignment: {...} }
 * Response: 401 Unauthorized - No token or invalid token
 * Response: 403 Forbidden - User is not an admin
 */
router.get('/stats', authenticate, authorizeRoles('ADMIN'), getDashboardStatistics);

export default router;
