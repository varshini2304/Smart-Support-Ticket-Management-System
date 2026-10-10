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
 * List all tickets for a customer with pagination and sorting
 * @param {string} customerId - MongoDB ID of customer
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of results per page
 * @returns {Promise<object>} { tickets: [], total, page, pages }
 * @throws {Error} If database error occurs
 */
export const getCustomerTickets = async (customerId, page = 1, limit = 10) => {
  try {
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Query tickets for this customer, sorted by createdAt descending (newest first)
    const tickets = await Ticket.find({ createdBy: customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination metadata
    const total = await Ticket.countDocuments({ createdBy: customerId });
    const pages = Math.ceil(total / limitNum);

    return {
      tickets: tickets.map(t => t.toJSON()),
      total,
      page: pageNum,
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
