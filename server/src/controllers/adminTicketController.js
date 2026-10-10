/**
 * Admin ticket controller functions
 * Handles HTTP requests and responses for admin ticket management
 * Validates input, calls services, maps errors to HTTP status codes
 */

import {
  getAllTickets,
  getTicketByIdAdmin,
  updateTicketAdmin,
  assignTicket as assignTicketService,
  getDashboardStats,
} from '../services/adminTicketService.js';

import {
  validateAdminTicketUpdate,
  validateAssignmentRequest,
  validatePaginationParams,
  validateTicketFilters,
} from '../validators/adminValidators.js';

/**
 * GET /api/admin/tickets
 * List all tickets with optional filtering
 * Query params: page=1, limit=10, status=?, priority=?
 */
export const getAllTicketsAdmin = async (req, res, next) => {
  try {
    const { page, limit, status, priority } = req.query;

    // Validate pagination parameters
    const paginationValidation = validatePaginationParams(page, limit);
    if (!paginationValidation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: paginationValidation.error,
      });
    }

    // Validate filters
    const filterValidation = validateTicketFilters({ status, priority });
    if (!filterValidation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: filterValidation.error,
      });
    }

    // Get tickets
    const result = await getAllTickets({ page, limit, status, priority });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error listing admin tickets:', error.message);
    next(error);
  }
};

/**
 * PATCH /api/admin/tickets/:id
 * Update ticket status and/or priority
 * Body: { status?, priority? }
 */
export const updateTicketStatusPriority = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate update data
    const validation = validateAdminTicketUpdate(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Update ticket
    const ticket = await updateTicketAdmin(id, req.body);

    if (!ticket) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ticket not found',
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join('; ');

      return res.status(400).json({
        error: 'Bad Request',
        message: messages,
      });
    }

    console.error('Error updating ticket:', error.message);
    next(error);
  }
};

/**
 * PATCH /api/admin/tickets/:id/assign
 * Assign ticket to a user
 * Body: { assignedTo: userId }
 */
export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate assignment request
    const validation = validateAssignmentRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    try {
      // Assign ticket
      const ticket = await assignTicketService(id, req.body.assignedTo);

      if (!ticket) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Ticket not found',
        });
      }

      res.status(200).json(ticket);
    } catch (error) {
      // Handle specific service errors
      if (error.code === 'INVALID_ASSIGNEE_ID') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid assignee ID format',
        });
      }

      if (error.code === 'ASSIGNEE_NOT_FOUND') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Assignee user not found',
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Error assigning ticket:', error.message);
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Get dashboard statistics about tickets
 */
export const getDashboardStatistics = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error.message);
    next(error);
  }
};
