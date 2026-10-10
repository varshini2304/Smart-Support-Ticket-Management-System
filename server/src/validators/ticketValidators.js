/**
 * Ticket validation functions
 * All validators return { valid: boolean, error?: string }
 */

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 5000;

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * Validate ticket title
 * @param {string} title - Ticket title
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateTitle = (title) => {
  if (!title) {
    return { valid: false, error: 'Title is required' };
  }

  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' };
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    return { valid: false, error: `Title must be at least ${TITLE_MIN_LENGTH} characters` };
  }

  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return { valid: false, error: `Title must not exceed ${TITLE_MAX_LENGTH} characters` };
  }

  return { valid: true };
};

/**
 * Validate ticket description
 * @param {string} description - Ticket description
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateDescription = (description) => {
  if (!description) {
    return { valid: false, error: 'Description is required' };
  }

  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length < DESCRIPTION_MIN_LENGTH) {
    return { valid: false, error: `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters` };
  }

  if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
    return { valid: false, error: `Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters` };
  }

  return { valid: true };
};

/**
 * Validate ticket status
 * @param {string} status - Ticket status
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateStatus = (status) => {
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
 * Validate ticket priority
 * @param {string} priority - Ticket priority
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validatePriority = (priority) => {
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
 * Validate ticket creation data
 * @param {object} data - Data to validate { title, description, priority }
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateTicketCreate = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid object' };
  }

  // Title is required
  const titleValidation = validateTitle(data.title);
  if (!titleValidation.valid) {
    return titleValidation;
  }

  // Description is required
  const descriptionValidation = validateDescription(data.description);
  if (!descriptionValidation.valid) {
    return descriptionValidation;
  }

  // Priority is optional (defaults to MEDIUM), but if provided, must be valid
  if (data.priority) {
    const priorityValidation = validatePriority(data.priority);
    if (!priorityValidation.valid) {
      return priorityValidation;
    }
  }

  // Ensure createdBy is NOT in the request body (only from authenticated user)
  if (data.createdBy) {
    return { valid: false, error: 'Cannot set createdBy in request body' };
  }

  // Ensure status is NOT in the request body (customers can't set status)
  if (data.status) {
    return { valid: false, error: 'Cannot set status in request body' };
  }

  return { valid: true };
};

/**
 * Validate ticket update data (for customers)
 * Customers can only update title and description, not status, priority, or createdBy
 * @param {object} data - Data to validate (only title and description allowed)
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateTicketUpdate = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid object' };
  }

  // Check for forbidden fields FIRST (before checking if any valid fields are present)
  if (data.status !== undefined) {
    return { valid: false, error: 'Cannot update status' };
  }

  if (data.priority !== undefined) {
    return { valid: false, error: 'Cannot update priority' };
  }

  if (data.createdBy !== undefined) {
    return { valid: false, error: 'Cannot update createdBy' };
  }

  // At least one updatable field must be provided
  if (data.title === undefined && data.description === undefined) {
    return { valid: false, error: 'At least one of title or description must be provided' };
  }

  // If title is provided, validate it
  if (data.title !== undefined) {
    const titleValidation = validateTitle(data.title);
    if (!titleValidation.valid) {
      return titleValidation;
    }
  }

  // If description is provided, validate it
  if (data.description !== undefined) {
    const descriptionValidation = validateDescription(data.description);
    if (!descriptionValidation.valid) {
      return descriptionValidation;
    }
  }

  return { valid: true };
};
