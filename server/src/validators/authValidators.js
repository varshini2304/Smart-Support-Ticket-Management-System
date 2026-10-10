/**
 * Validate email format and length
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email must not exceed 255 characters' };
  }

  return { valid: true };
};

/**
 * Validate password strength and length
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must not exceed 128 characters' };
  }

  return { valid: true };
};

/**
 * Validate user name
 * @param {string} name - Name to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateName = (name) => {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name must not exceed 100 characters' };
  }

  return { valid: true };
};

/**
 * Validate registration data
 * @param {object} data - Registration data { name, email, password }
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateRegistration = (data) => {
  // Validate name
  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  return { valid: true };
};

/**
 * Validate login data
 * @param {object} data - Login data { email, password }
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateLogin = (data) => {
  if (!data.email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!data.password) {
    return { valid: false, error: 'Password is required' };
  }

  return { valid: true };
};
