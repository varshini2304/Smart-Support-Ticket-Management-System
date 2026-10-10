/**
 * Admin ticket service functions
 * Handles admin-specific business logic for tickets
 * Does not contain HTTP concerns; errors thrown for controller to handle
 */

import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * List all tickets with admin filtering, pagination, and sorting
 * @param {object} options - { page?, limit?, status?, priority?, search? }
 * @returns {Promise<object>} { tickets: [], total, page, pages }
 * @throws {Error} If database error occurs
 */
export const getAllTickets = async (options = {}) => {
  try {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (options.status) {
      filter.status = options.status;
    }
    if (options.priority) {
      filter.priority = options.priority;
    }

    // Text search across title and description (case-insensitive)
    if (options.search) {
      const escaped = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    // Query all tickets with optional filters, sorted by createdAt descending
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const total = await Ticket.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return {
      tickets: tickets.map(t => {
        const json = t.toJSON();
        if (!json.createdBy && t.populated('createdBy')) {
          json.createdBy = { _id: t.populated('createdBy') };
        }
        if (!json.assignedTo && t.populated('assignedTo')) {
          json.assignedTo = { _id: t.populated('assignedTo') };
        }
        if (!json.resolvedBy && t.populated('resolvedBy')) {
          json.resolvedBy = { _id: t.populated('resolvedBy') };
        }
        return json;
      }),
      total,
      page,
      pages,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get a ticket by ID (admin can access any ticket)
 * @param {string} ticketId - MongoDB ID of ticket
 * @returns {Promise<object|null>} Ticket if found, null otherwise
 * @throws {Error} If database error occurs
 */
export const getTicketByIdAdmin = async (ticketId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await Ticket.findById(ticketId)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role');

    if (!ticket) return null;

    const json = ticket.toJSON();
    if (!json.createdBy && ticket.populated('createdBy')) {
      json.createdBy = { _id: ticket.populated('createdBy') };
    }
    if (!json.assignedTo && ticket.populated('assignedTo')) {
      json.assignedTo = { _id: ticket.populated('assignedTo') };
    }
    if (!json.resolvedBy && ticket.populated('resolvedBy')) {
      json.resolvedBy = { _id: ticket.populated('resolvedBy') };
    }
    return json;
  } catch (error) {
    throw error;
  }
};

/**
 * Update ticket status and/or priority (admin only)
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {object} updates - { status?, priority?, resolutionNote?, resolvedBy? }
 * @returns {Promise<object|null>} Updated ticket if found, null if not found
 * @throws {Error} If validation or database error occurs
 */
export const updateTicketAdmin = async (ticketId, updates) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    // Build update object with only allowed fields
    const allowedUpdates = {};
    if (updates.status !== undefined) {
      allowedUpdates.status = updates.status;
      if (updates.status === 'RESOLVED') {
        allowedUpdates.resolvedAt = updates.resolvedAt || new Date();
        if (updates.resolvedBy) {
          allowedUpdates.resolvedBy = updates.resolvedBy;
        }
      }
    }
    if (updates.priority !== undefined) {
      allowedUpdates.priority = updates.priority;
    }
    if (updates.resolutionNote !== undefined) {
      allowedUpdates.resolutionNote = updates.resolutionNote;
    }

    // Update ticket
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role');

    return ticket ? ticket.toJSON() : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Resolve ticket (admin only)
 * Updates status to RESOLVED, sets resolution note, resolvedAt, and resolving admin ID
 * Idempotent: if already resolved, updates resolution note if provided
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {string} resolutionNote - Explanation/notes on how ticket was resolved
 * @param {string} adminUserId - ID of resolving administrator
 * @returns {Promise<object|null>} Updated ticket if found, null if not found
 */
export const resolveTicketAdmin = async (ticketId, resolutionNote, adminUserId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return null;
    }

    const wasAlreadyResolved = ticket.status === 'RESOLVED';

    ticket.status = 'RESOLVED';
    if (resolutionNote !== undefined) {
      ticket.resolutionNote = resolutionNote.trim();
    }
    ticket.resolvedAt = ticket.resolvedAt || new Date();
    if (adminUserId && mongoose.Types.ObjectId.isValid(adminUserId)) {
      ticket.resolvedBy = adminUserId;
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role');

    const result = populated ? populated.toJSON() : ticket.toJSON();
    if (populated) {
      if (!result.createdBy && populated.populated('createdBy')) {
        result.createdBy = { _id: populated.populated('createdBy') };
      }
      if (!result.assignedTo && populated.populated('assignedTo')) {
        result.assignedTo = { _id: populated.populated('assignedTo') };
      }
      if (!result.resolvedBy && populated.populated('resolvedBy')) {
        result.resolvedBy = { _id: populated.populated('resolvedBy') };
      }
    }
    result.wasAlreadyResolved = wasAlreadyResolved;
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Assign a ticket to a user
 * @param {string} ticketId - MongoDB ID of ticket
 * @param {string} assigneeId - MongoDB ID of user to assign to
 * @returns {Promise<object|null>} Updated ticket if successful, null if ticket not found or assignee invalid
 * @throws {Error} If database error occurs
 */
export const assignTicket = async (ticketId, assigneeId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      const error = new Error('Invalid assignee ID format');
      error.code = 'INVALID_ASSIGNEE_ID';
      throw error;
    }

    // Verify assignee exists
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      const error = new Error('Assignee user not found');
      error.code = 'ASSIGNEE_NOT_FOUND';
      throw error;
    }

    // Assign ticket to user
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assignedTo: assigneeId },
      { new: true, runValidators: true }
    );

    return ticket ? ticket.toJSON() : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Get dashboard statistics about tickets
 * @returns {Promise<object>} Statistics object with counts by status and priority
 * @throws {Error} If database error occurs
 */
export const getDashboardStats = async () => {
  try {
    // Total tickets count
    const totalTickets = await Ticket.countDocuments();

    // Count by status
    const statusCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count by priority
    const priorityCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Count by assignment status
    const assignmentStats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          assigned: {
            $sum: {
              $cond: [{ $ne: ['$assignedTo', null] }, 1, 0],
            },
          },
          unassigned: {
            $sum: {
              $cond: [{ $eq: ['$assignedTo', null] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Build response object
    const stats = {
      total: totalTickets,
      byStatus: {},
      byPriority: {},
      assignment: {
        assigned: 0,
        unassigned: 0,
      },
    };

    // Populate status counts with defaults
    ['OPEN', 'IN_PROGRESS', 'RESOLVED'].forEach(status => {
      const found = statusCounts.find(s => s._id === status);
      stats.byStatus[status] = found ? found.count : 0;
    });

    // Populate priority counts with defaults
    ['LOW', 'MEDIUM', 'HIGH'].forEach(priority => {
      const found = priorityCounts.find(p => p._id === priority);
      stats.byPriority[priority] = found ? found.count : 0;
    });

    // Populate assignment stats
    if (assignmentStats.length > 0) {
      stats.assignment.assigned = assignmentStats[0].assigned;
      stats.assignment.unassigned = assignmentStats[0].unassigned;
    }

    return stats;
  } catch (error) {
    throw error;
  }
};
