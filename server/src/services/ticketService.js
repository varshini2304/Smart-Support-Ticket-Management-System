/**
 * Ticket service functions
 * Handles all business logic for tickets
 * Does not contain HTTP concerns; errors thrown for controller to handle
 */

import Ticket from '../models/Ticket.js';
import mongoose from 'mongoose';

/**
 * Create a new ticket for a customer
 * @param {string} customerId - MongoDB ID of the customer creating the ticket
 * @param {object} ticketData - { title, description, priority? }
 * @returns {Promise<object>} Created ticket (without sensitive fields)
 * @throws {Error} If validation or database error occurs
 */
export const createTicket = async (customerId, ticketData) => {
  try {
    const ticket = new Ticket({
      title: ticketData.title.trim(),
      description: ticketData.description.trim(),
      priority: ticketData.priority || 'MEDIUM',
      createdBy: customerId,
      status: 'OPEN',
    });

    await ticket.save();
    return ticket.toJSON();
  } catch (error) {
    throw error;
  }
};

/**
 * Get a ticket by ID, verifying ownership
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {string} customerId - MongoDB ID of customer requesting it
 * @returns {Promise<object|null>} Ticket if owned by customer, null otherwise
 * @throws {Error} If database error occurs
 */
export const getTicketById = async (ticketId, customerId) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      createdBy: customerId,
    });

    return ticket ? ticket.toJSON() : null;
  } catch (error) {
    throw error;
  }
};

/**
 * List all tickets for a customer with pagination, sorting, and server-side filters
 * @param {string} customerId - MongoDB ID of customer
 * @param {object} options - { page?, limit?, search?, status?, priority?, category? }
 * @returns {Promise<object>} { tickets: [], total, page, pages }
 * @throws {Error} If database error occurs
 */
export const getCustomerTickets = async (customerId, options = {}) => {
  try {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filter — always scoped to this customer
    const filter = { createdBy: customerId };

    if (options.status) {
      filter.status = options.status;
    }
    if (options.priority) {
      filter.priority = options.priority;
    }
    if (options.category) {
      filter.category = options.category;
    }

    // Text search across title and description (case-insensitive)
    if (options.search) {
      const escaped = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return {
      tickets: tickets.map(t => t.toJSON()),
      total,
      page,
      pages,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update a ticket's title and/or description
 * Only allows customers to update title and description
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {string} customerId - MongoDB ID of customer (for ownership verification)
 * @param {object} updates - { title?, description? }
 * @returns {Promise<object|null>} Updated ticket if owned by customer, null if not found
 * @throws {Error} If validation or database error occurs
 */
export const updateTicket = async (ticketId, customerId, updates) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    // Build update object with only allowed fields
    const allowedUpdates = {};
    if (updates.title !== undefined) {
      allowedUpdates.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      allowedUpdates.description = updates.description.trim();
    }

    // Update only if customer owns the ticket
    const ticket = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        createdBy: customerId,
      },
      allowedUpdates,
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    return ticket ? ticket.toJSON() : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify that a customer owns a ticket (for authorization checks)
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {string} customerId - MongoDB ID of customer
 * @returns {Promise<boolean>} True if customer owns ticket, false otherwise
 * @throws {Error} If database error occurs
 */
export const customerOwnsTicket = async (ticketId, customerId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return false;
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      createdBy: customerId,
    });

    return !!ticket;
  } catch (error) {
    throw error;
  }
};
