import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
        message: 'Status must be one of: OPEN, IN_PROGRESS, RESOLVED',
      },
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: 'Priority must be one of: LOW, MEDIUM, HIGH',
      },
      default: 'MEDIUM',
    },
    category: {
      type: String,
      trim: true,
      default: 'Technical Issue',
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution note must not exceed 500 characters'],
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ticket must have a creator'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Ensure sensitive data is never returned in JSON responses
 * Note: For tickets, we might want to exclude createdBy ObjectId in some cases,
 * but we keep it here since it's needed to verify ownership
 */
ticketSchema.methods.toJSON = function () {
  const ticket = this.toObject();
  delete ticket.__v; // Remove MongoDB version field
  return ticket;
};

/**
 * Index for fast queries filtering by customer (createdBy)
 * This is the most common query pattern for listing customer's tickets
 */
ticketSchema.index({ createdBy: 1 });

/**
 * Compound index for sorted retrieval by customer and status
 * Useful for future filtering: "get my open tickets"
 */
ticketSchema.index({ createdBy: 1, status: 1 });

/**
 * Index for fast queries filtering by assignment
 * Admin listing tickets by assignee
 */
ticketSchema.index({ assignedTo: 1 });

/**
 * Compound index for admin queries by status
 */
ticketSchema.index({ status: 1, priority: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
