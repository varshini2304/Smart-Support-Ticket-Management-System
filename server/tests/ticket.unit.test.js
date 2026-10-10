/**
 * Ticket Unit Tests
 * Tests validators without requiring a live MongoDB connection
 *
 * To run: npm test -- --testPathPattern="ticket.unit"
 */

import {
  validateTitle,
  validateDescription,
  validateStatus,
  validatePriority,
  validateTicketCreate,
  validateTicketUpdate,
} from '../src/validators/ticketValidators.js';

// ============================================================================
// VALIDATOR TESTS
// ============================================================================

describe('Ticket Validators', () => {
  describe('validateTitle', () => {
    it('should accept valid title', () => {
      const result = validateTitle('My Ticket Title');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject title shorter than 3 characters', () => {
      const result = validateTitle('AB');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should accept title with exactly 3 characters', () => {
      const result = validateTitle('ABC');
      expect(result.valid).toBe(true);
    });

    it('should reject title longer than 200 characters', () => {
      const longTitle = 'A'.repeat(201);
      const result = validateTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 200 characters');
    });

    it('should accept title with exactly 200 characters', () => {
      const title = 'A'.repeat(200);
      const result = validateTitle(title);
      expect(result.valid).toBe(true);
    });

    it('should reject missing title', () => {
      const result = validateTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('should reject null title', () => {
      const result = validateTitle(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('should reject non-string title', () => {
      const result = validateTitle(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    it('should trim whitespace from title', () => {
      const result = validateTitle('  Valid Title  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDescription', () => {
    it('should accept valid description', () => {
      const result = validateDescription('This is a detailed description of my issue');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject description shorter than 10 characters', () => {
      const result = validateDescription('Too short');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    it('should accept description with exactly 10 characters', () => {
      const result = validateDescription('1234567890');
      expect(result.valid).toBe(true);
    });

    it('should reject description longer than 5000 characters', () => {
      const longDesc = 'A'.repeat(5001);
      const result = validateDescription(longDesc);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 5000 characters');
    });

    it('should accept description with exactly 5000 characters', () => {
      const desc = 'A'.repeat(5000);
      const result = validateDescription(desc);
      expect(result.valid).toBe(true);
    });

    it('should reject missing description', () => {
      const result = validateDescription('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Description is required');
    });

    it('should reject null description', () => {
      const result = validateDescription(null);
      expect(result.valid).toBe(false);
    });

    it('should reject non-string description', () => {
      const result = validateDescription({ text: 'description' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validateStatus', () => {
    it('should accept OPEN status', () => {
      const result = validateStatus('OPEN');
      expect(result.valid).toBe(true);
    });

    it('should accept IN_PROGRESS status', () => {
      const result = validateStatus('IN_PROGRESS');
      expect(result.valid).toBe(true);
    });

    it('should accept RESOLVED status', () => {
      const result = validateStatus('RESOLVED');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateStatus('CLOSED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be one of');
    });

    it('should reject case-insensitive status', () => {
      const result = validateStatus('open');
      expect(result.valid).toBe(false);
    });

    it('should reject missing status', () => {
      const result = validateStatus('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Status is required');
    });

    it('should reject null status', () => {
      const result = validateStatus(null);
      expect(result.valid).toBe(false);
    });

    it('should reject non-string status', () => {
      const result = validateStatus(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validatePriority', () => {
    it('should accept LOW priority', () => {
      const result = validatePriority('LOW');
      expect(result.valid).toBe(true);
    });

    it('should accept MEDIUM priority', () => {
      const result = validatePriority('MEDIUM');
      expect(result.valid).toBe(true);
    });

    it('should accept HIGH priority', () => {
      const result = validatePriority('HIGH');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid priority', () => {
      const result = validatePriority('URGENT');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be one of');
    });

    it('should reject case-insensitive priority', () => {
      const result = validatePriority('low');
      expect(result.valid).toBe(false);
    });

    it('should reject missing priority', () => {
      const result = validatePriority('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Priority is required');
    });

    it('should reject non-string priority', () => {
      const result = validatePriority(1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validateTicketCreate', () => {
    it('should accept valid ticket creation data', () => {
      const data = {
        title: 'Unable to login',
        description: 'I cannot access my account with my credentials',
        priority: 'HIGH',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(true);
    });

    it('should accept ticket creation with default priority', () => {
      const data = {
        title: 'Login issue',
        description: 'I cannot access my account with my credentials',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(true);
    });

    it('should reject if title is missing', () => {
      const data = {
        description: 'This is a valid description',
        priority: 'MEDIUM',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('should reject if description is missing', () => {
      const data = {
        title: 'Valid Title',
        priority: 'MEDIUM',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Description is required');
    });

    it('should reject if title is invalid', () => {
      const data = {
        title: 'AB', // Too short
        description: 'This is a valid description',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject if description is invalid', () => {
      const data = {
        title: 'Valid Title',
        description: 'Too short', // Less than 10 chars
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    it('should reject if priority is invalid', () => {
      const data = {
        title: 'Valid Title',
        description: 'This is a valid description',
        priority: 'INVALID',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be one of');
    });

    it('should reject if createdBy is provided in request body', () => {
      const data = {
        title: 'Valid Title',
        description: 'This is a valid description',
        createdBy: '507f1f77bcf86cd799439011',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot set createdBy');
    });

    it('should reject if status is provided in request body', () => {
      const data = {
        title: 'Valid Title',
        description: 'This is a valid description',
        status: 'RESOLVED',
      };
      const result = validateTicketCreate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot set status');
    });

    it('should reject null request body', () => {
      const result = validateTicketCreate(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid object');
    });
  });

  describe('validateTicketUpdate', () => {
    it('should accept update with title only', () => {
      const data = { title: 'Updated Title' };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should accept update with description only', () => {
      const data = { description: 'Updated description for the ticket' };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should accept update with both title and description', () => {
      const data = {
        title: 'Updated Title',
        description: 'Updated description for the ticket',
      };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should reject if only forbidden fields provided', () => {
      const data = { status: 'RESOLVED' }; // Only a forbidden field
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update status');
    });

    it('should reject if neither title nor description provided', () => {
      const data = {}; // Empty object, no allowed fields
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('title or description');
    });

    it('should reject if trying to update status', () => {
      const data = {
        title: 'Updated Title',
        status: 'RESOLVED',
      };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update status');
    });

    it('should reject if trying to update priority', () => {
      const data = {
        description: 'Updated description',
        priority: 'HIGH',
      };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update priority');
    });

    it('should reject if trying to update createdBy', () => {
      const data = {
        title: 'Updated Title',
        createdBy: '507f1f77bcf86cd799439012',
      };
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update createdBy');
    });

    it('should reject if title update is invalid', () => {
      const data = { title: 'AB' }; // Too short
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject if description update is invalid', () => {
      const data = { description: 'Too short' }; // Less than 10 chars
      const result = validateTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    it('should reject null request body', () => {
      const result = validateTicketUpdate(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid object');
    });

    it('should reject empty object', () => {
      const result = validateTicketUpdate({});
      expect(result.valid).toBe(false);
      expect(result.error).toContain('title or description');
    });
  });
});
