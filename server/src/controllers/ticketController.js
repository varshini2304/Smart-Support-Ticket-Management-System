/**
 * Ticket controller functions
 * Handles HTTP requests and responses
 * Validates input, calls services, maps errors to HTTP status codes
 */

import {
  createTicket as createTicketService,
  getTicketById as getTicketByIdService,
  getCustomerTickets as getCustomerTicketsService,
  updateTicket as updateTicketService,
  customerOwnsTicket,
} from '../services/ticketService.js';

import {
  validateTicketCreate,
  validateTicketUpdate,
} from '../validators/ticketValidators.js';

/**
 * POST /api/tickets
 * Create a new ticket for the authenticated customer
 */
export const createTicket = async (req, res, next) => {
  try {
    // Validate input
    const validation = validateTicketCreate(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Create ticket (createdBy comes from authenticated user, never from request body)
    const ticket = await createTicketService(req.user.userId, req.body);

    res.status(201).json(ticket);
  } catch (error) {
    // Log and pass unexpected errors to global handler
    console.error('Error creating ticket:', error.message);
    next(error);
  }
};

/**
 * GET /api/tickets
 * List all tickets for the authenticated customer with pagination and filters
 * Query params: page=1, limit=10, search=, status=, priority=, category=
 */
export const getMyTickets = async (req, res, next) => {
  try {
    const { page, limit, search, status, priority, category } = req.query;

    const result = await getCustomerTicketsService(req.user.userId, {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      priority: priority || undefined,
      category: category || undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error listing tickets:', error.message);
    next(error);
  }
};

/**
 * GET /api/tickets/:id
 * Retrieve a specific ticket by ID (only if owned by authenticated customer)
 * Returns 404 for tickets not owned by customer (don't leak existence across customers)
 */
export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Retrieve ticket (checks ownership in database query)
    const ticket = await getTicketByIdService(id, req.user.userId);

    if (!ticket) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ticket not found',
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error retrieving ticket:', error.message);
    next(error);
  }
};

/**
 * PATCH /api/tickets/:id
 * Update a ticket (only title and description allowed for customers)
 * Customers cannot update status, priority, or ownership
 * Returns 404 for tickets not owned by customer
 */
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate update data (checks that only allowed fields are being updated)
    const validation = validateTicketUpdate(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: validation.error,
      });
    }

    // Update ticket (checks ownership in database query)
    const ticket = await updateTicketService(id, req.user.userId, req.body);

    if (!ticket) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Ticket not found',
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    // Handle Mongoose validation errors (e.g., field too long)
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
