/**
 * Admin-specific validation functions
 * All validators return { valid: boolean, error?: string }
 */

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Validate status update for admin
 * @param {string} status - Ticket status
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateStatusUpdate = (status) => {
  if (!status) {
    return { valid: false, error: 'Status is required' };
  }

  if (typeof status !== 'string') {
    return { valid: false, error: 'Status must be a string' };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { valid: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` };
  }

  return { valid: true };
};

/**
 * Validate priority update for admin
 * @param {string} priority - Ticket priority
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validatePriorityUpdate = (priority) => {
  if (!priority) {
    return { valid: false, error: 'Priority is required' };
  }

  if (typeof priority !== 'string') {
    return { valid: false, error: 'Priority must be a string' };
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return { valid: false, error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` };
  }

  return { valid: true };
};

/**
 * Validate resolution note
 * @param {string} note - Resolution note
 * @returns {{ valid: boolean, error?: string, sanitized?: string }} Validation result
 */
export const validateResolutionNote = (note) => {
  if (note === undefined || note === null) {
    return { valid: false, error: 'Resolution note is required' };
  }
  if (typeof note !== 'string') {
    return { valid: false, error: 'Resolution note must be a string' };
  }
  const trimmed = note.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Resolution note cannot be empty' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Resolution note must not exceed 500 characters' };
  }
  return { valid: true, sanitized: trimmed };
};

/**
 * Validate resolve ticket payload
 * @param {object} data - { resolutionNote }
 * @returns {{ valid: boolean, error?: string, resolutionNote?: string }} Validation result
 */
export const validateResolveTicket = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid object' };
  }

  if (data.resolutionNote === undefined || data.resolutionNote === null) {
    return { valid: false, error: 'Resolution note is required' };
  }

  const noteValidation = validateResolutionNote(data.resolutionNote);
  if (!noteValidation.valid) {
    return noteValidation;
  }

  return { valid: true, resolutionNote: noteValidation.sanitized };
};

/**
 * Validate admin ticket update (status and/or priority and/or resolutionNote)
 * @param {object} data - Data to validate { status?, priority?, resolutionNote? }
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateAdminTicketUpdate = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid object' };
  }

  // Check for forbidden fields
  if (data.title !== undefined) {
    return { valid: false, error: 'Cannot update title as admin' };
  }

  if (data.description !== undefined) {
    return { valid: false, error: 'Cannot update description as admin' };
  }

  if (data.createdBy !== undefined) {
    return { valid: false, error: 'Cannot update createdBy' };
  }

  // At least one updatable field must be provided
  if (data.status === undefined && data.priority === undefined && data.resolutionNote === undefined) {
    return { valid: false, error: 'At least one of status or priority (or resolution note) must be provided' };
  }

  // If status is provided, validate it
  if (data.status !== undefined) {
    const statusValidation = validateStatusUpdate(data.status);
    if (!statusValidation.valid) {
      return statusValidation;
    }
  }

  // If priority is provided, validate it
  if (data.priority !== undefined) {
    const priorityValidation = validatePriorityUpdate(data.priority);
    if (!priorityValidation.valid) {
      return priorityValidation;
    }
  }

  // If resolutionNote is provided, validate it
  if (data.resolutionNote !== undefined) {
    const noteValidation = validateResolutionNote(data.resolutionNote);
    if (!noteValidation.valid) {
      return noteValidation;
    }
  }

  return { valid: true };
};

/**
 * Validate assignment data (assignee user ID)
 * @param {string} assigneeId - MongoDB ID of user to assign to
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateAssigneeId = (assigneeId) => {
  if (!assigneeId) {
    return { valid: false, error: 'Assignee ID is required' };
  }

  if (typeof assigneeId !== 'string') {
    return { valid: false, error: 'Assignee ID must be a string' };
  }

  // MongoDB ID validation happens in service layer
  return { valid: true };
};

/**
 * Validate assignment request body
 * @param {object} data - Data to validate { assignedTo }
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateAssignmentRequest = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid object' };
  }

  // assignedTo is required
  if (data.assignedTo === undefined) {
    return { valid: false, error: 'assignedTo is required' };
  }

  // Validate assignee ID
  return validateAssigneeId(data.assignedTo);
};

/**
 * Validate pagination parameters for admin listing
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of results per page
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1) {
    return { valid: false, error: 'Page must be at least 1' };
  }

  if (limitNum < 1) {
    return { valid: false, error: 'Limit must be at least 1' };
  }

  if (limitNum > 100) {
    return { valid: false, error: 'Limit cannot exceed 100' };
  }

  return { valid: true };
};

/**
 * Validate admin ticket filters
 * @param {object} filters - Filters object { status?, priority? }
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateTicketFilters = (filters) => {
  if (!filters || typeof filters !== 'object') {
    return { valid: true }; // Filters are optional
  }

  if (filters.status !== undefined) {
    if (typeof filters.status !== 'string' || !VALID_STATUSES.includes(filters.status)) {
      return { valid: false, error: `Status filter must be one of: ${VALID_STATUSES.join(', ')}` };
    }
  }

  if (filters.priority !== undefined) {
    if (typeof filters.priority !== 'string' || !VALID_PRIORITIES.includes(filters.priority)) {
      return { valid: false, error: `Priority filter must be one of: ${VALID_PRIORITIES.join(', ')}` };
    }
  }

  return { valid: true };
};
