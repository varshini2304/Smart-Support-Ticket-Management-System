/**
 * Admin Unit Tests
 * Tests admin validators without requiring a live MongoDB connection
 *
 * To run: npm test -- --testPathPattern="admin.unit"
 */

import {
  validateStatusUpdate,
  validatePriorityUpdate,
  validateAdminTicketUpdate,
  validateAssigneeId,
  validateAssignmentRequest,
  validatePaginationParams,
  validateTicketFilters,
} from '../src/validators/adminValidators.js';

// ============================================================================
// VALIDATOR TESTS
// ============================================================================

describe('Admin Validators', () => {
  describe('validateStatusUpdate', () => {
    it('should accept valid status OPEN', () => {
      const result = validateStatusUpdate('OPEN');
      expect(result.valid).toBe(true);
    });

    it('should accept valid status IN_PROGRESS', () => {
      const result = validateStatusUpdate('IN_PROGRESS');
      expect(result.valid).toBe(true);
    });

    it('should accept valid status RESOLVED', () => {
      const result = validateStatusUpdate('RESOLVED');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateStatusUpdate('CLOSED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be one of');
    });

    it('should reject case-insensitive status', () => {
      const result = validateStatusUpdate('open');
      expect(result.valid).toBe(false);
    });

    it('should reject missing status', () => {
      const result = validateStatusUpdate('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Status is required');
    });

    it('should reject non-string status', () => {
      const result = validateStatusUpdate(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validatePriorityUpdate', () => {
    it('should accept valid priority LOW', () => {
      const result = validatePriorityUpdate('LOW');
      expect(result.valid).toBe(true);
    });

    it('should accept valid priority MEDIUM', () => {
      const result = validatePriorityUpdate('MEDIUM');
      expect(result.valid).toBe(true);
    });

    it('should accept valid priority HIGH', () => {
      const result = validatePriorityUpdate('HIGH');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid priority', () => {
      const result = validatePriorityUpdate('URGENT');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be one of');
    });

    it('should reject missing priority', () => {
      const result = validatePriorityUpdate('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAdminTicketUpdate', () => {
    it('should accept valid status update', () => {
      const data = { status: 'RESOLVED' };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should accept valid priority update', () => {
      const data = { priority: 'HIGH' };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should accept both status and priority', () => {
      const data = { status: 'IN_PROGRESS', priority: 'HIGH' };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(true);
    });

    it('should reject if neither status nor priority provided', () => {
      const data = {};
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('status or priority');
    });

    it('should reject if trying to update title', () => {
      const data = {
        status: 'RESOLVED',
        title: 'New Title',
      };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update title');
    });

    it('should reject if trying to update description', () => {
      const data = {
        priority: 'HIGH',
        description: 'New description',
      };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update description');
    });

    it('should reject if trying to update createdBy', () => {
      const data = {
        status: 'RESOLVED',
        createdBy: '507f1f77bcf86cd799439011',
      };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot update createdBy');
    });

    it('should reject invalid status', () => {
      const data = { status: 'INVALID' };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Status must be one of');
    });

    it('should reject invalid priority', () => {
      const data = { priority: 'CRITICAL' };
      const result = validateAdminTicketUpdate(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Priority must be one of');
    });

    it('should reject null request body', () => {
      const result = validateAdminTicketUpdate(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid object');
    });
  });

  describe('validateAssigneeId', () => {
    it('should accept valid MongoDB ID string', () => {
      const result = validateAssigneeId('507f1f77bcf86cd799439011');
      expect(result.valid).toBe(true);
    });

    it('should reject missing assignee ID', () => {
      const result = validateAssigneeId('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject non-string assignee ID', () => {
      const result = validateAssigneeId(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validateAssignmentRequest', () => {
    it('should accept valid assignment request', () => {
      const data = { assignedTo: '507f1f77bcf86cd799439011' };
      const result = validateAssignmentRequest(data);
      expect(result.valid).toBe(true);
    });

    it('should reject if assignedTo is missing', () => {
      const data = {};
      const result = validateAssignmentRequest(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('assignedTo is required');
    });

    it('should reject if assignedTo is null', () => {
      const data = { assignedTo: null };
      const result = validateAssignmentRequest(data);
      expect(result.valid).toBe(false);
    });

    it('should reject non-string assignedTo', () => {
      const data = { assignedTo: 123 };
      const result = validateAssignmentRequest(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validatePaginationParams', () => {
    it('should accept valid pagination params', () => {
      const result = validatePaginationParams(1, 10);
      expect(result.valid).toBe(true);
    });

    it('should accept default params (undefined)', () => {
      const result = validatePaginationParams(undefined, undefined);
      expect(result.valid).toBe(true);
    });

    it('should accept high page number', () => {
      const result = validatePaginationParams(100, 10);
      expect(result.valid).toBe(true);
    });

    it('should accept maximum limit (100)', () => {
      const result = validatePaginationParams(1, 100);
      expect(result.valid).toBe(true);
    });

    it('should coerce page 0 to page 1', () => {
      const result = validatePaginationParams(0, 10);
      expect(result.valid).toBe(true); // 0 is coerced to 1 by parseInt || 1
    });

    it('should reject negative page', () => {
      const result = validatePaginationParams(-1, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1');
    });

    it('should coerce limit 0 to limit 10', () => {
      const result = validatePaginationParams(1, 0);
      expect(result.valid).toBe(true); // 0 is coerced to 10 by parseInt || 10
    });

    it('should reject limit > 100', () => {
      const result = validatePaginationParams(1, 101);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed 100');
    });
  });

  describe('validateTicketFilters', () => {
    it('should accept no filters', () => {
      const result = validateTicketFilters({});
      expect(result.valid).toBe(true);
    });

    it('should accept valid status filter', () => {
      const result = validateTicketFilters({ status: 'OPEN' });
      expect(result.valid).toBe(true);
    });

    it('should accept valid priority filter', () => {
      const result = validateTicketFilters({ priority: 'HIGH' });
      expect(result.valid).toBe(true);
    });

    it('should accept both filters', () => {
      const result = validateTicketFilters({ status: 'OPEN', priority: 'HIGH' });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid status filter', () => {
      const result = validateTicketFilters({ status: 'INVALID' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Status filter');
    });

    it('should reject invalid priority filter', () => {
      const result = validateTicketFilters({ priority: 'CRITICAL' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Priority filter');
    });

    it('should reject case-insensitive status filter', () => {
      const result = validateTicketFilters({ status: 'open' });
      expect(result.valid).toBe(false);
    });

    it('should accept undefined filters object', () => {
      const result = validateTicketFilters(undefined);
      expect(result.valid).toBe(true);
    });
  });
});
