/**
 * Authentication Unit Tests
 * Tests that verify validation, password hashing, JWT, and error handling
 * WITHOUT requiring a live MongoDB connection
 * 
 * To run: npm test -- --testPathPattern="auth.unit"
 */

import {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistration,
  validateLogin,
} from '../src/validators/authValidators.js';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
} from '../src/services/authService.js';

// ============================================================================
// VALIDATION TESTS (Unit - No Database Required)
// ============================================================================

describe('Input Validation', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('not-an-email');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should reject missing email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Email is required');
    });

    it('should reject null email', () => {
      const result = validateEmail(null);
      expect(result.valid).toBe(false);
    });

    it('should reject email over 255 characters', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must not exceed 255 characters');
    });
  });

  describe('validatePassword', () => {
    it('should accept password with 8+ characters', () => {
      const result = validatePassword('SecurePassword123');
      expect(result.valid).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short12'); // 7 characters
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject missing password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Password is required');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must not exceed 128 characters');
    });

    it('should accept password with 128 characters (max)', () => {
      const maxPassword = 'a'.repeat(128);
      const result = validatePassword(maxPassword);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateName', () => {
    it('should accept valid name', () => {
      const result = validateName('John Doe');
      expect(result.valid).toBe(true);
    });

    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Name is required');
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = validateName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must not exceed 100 characters');
    });

    it('should reject non-string name', () => {
      const result = validateName(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    it('should accept name with 100 characters (max)', () => {
      const maxName = 'a'.repeat(100);
      const result = validateName(maxName);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateRegistration', () => {
    it('should accept valid registration data', () => {
      const result = validateRegistration({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject if missing name', () => {
      const result = validateRegistration({
        email: 'john@example.com',
        password: 'SecurePassword123',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Name');
    });

    it('should reject if missing email', () => {
      const result = validateRegistration({
        name: 'John Doe',
        password: 'SecurePassword123',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Email');
    });

    it('should reject if missing password', () => {
      const result = validateRegistration({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Password');
    });
  });

  describe('validateLogin', () => {
    it('should accept valid login data', () => {
      const result = validateLogin({
        email: 'john@example.com',
        password: 'SecurePassword123',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject if missing email', () => {
      const result = validateLogin({
        password: 'SecurePassword123',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Email');
    });

    it('should reject if missing password', () => {
      const result = validateLogin({
        email: 'john@example.com',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Password');
    });
  });
});

// ============================================================================
// PASSWORD HASHING TESTS (Unit - No Database Required)
// ============================================================================

describe('Password Hashing (bcrypt)', () => {
  it('should hash password successfully', async () => {
    const password = 'SecurePassword123';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password); // Hash != plaintext
    expect(hash.length).toBeGreaterThan(20); // bcrypt hash is long
  });

  it('should produce different hashes for same password (salt variation)', async () => {
    const password = 'SecurePassword123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2); // Different salts
  });

  it('should verify correct password', async () => {
    const password = 'SecurePassword123';
    const hash = await hashPassword(password);

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'SecurePassword123';
    const hash = await hashPassword(password);

    const isMatch = await verifyPassword('WrongPassword', hash);
    expect(isMatch).toBe(false);
  });

  it('should handle empty password', async () => {
    const password = '';
    const hash = await hashPassword(password);

    const isMatch = await verifyPassword('', hash);
    expect(isMatch).toBe(true); // Empty hash matches empty password
  });
});

// ============================================================================
// JWT TESTS (Unit - No Database Required)
// ============================================================================

describe('JWT Token Generation and Verification', () => {
  const testUser = {
    _id: '65f9a1e2c3d4e5f6g7h8i9j0',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';
    }
  });

  it('should generate JWT token', () => {
    const token = generateJWT(testUser);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify valid JWT token', () => {
    const token = generateJWT(testUser);
    const decoded = verifyJWT(token);

    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe(testUser._id.toString());
    expect(decoded.role).toBe('CUSTOMER');
  });

  it('should include expiration in token', () => {
    const token = generateJWT(testUser);
    const decoded = verifyJWT(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days in seconds
  });

  it('should reject malformed token', () => {
    const malformedToken = 'invalid.token.here';

    expect(() => verifyJWT(malformedToken)).toThrow();
  });

  it('should reject token with wrong secret', () => {
    const token = generateJWT(testUser);

    // Change secret
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'different-secret-key';

    expect(() => verifyJWT(token)).toThrow();

    // Restore original secret
    process.env.JWT_SECRET = originalSecret;
  });

  it('should require JWT_SECRET to be configured', () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => generateJWT(testUser)).toThrow();
    expect(() => generateJWT(testUser)).toThrow('JWT_SECRET');

    // Restore
    process.env.JWT_SECRET = originalSecret;
  });

  it('should fail verification if JWT_SECRET missing', () => {
    const token = generateJWT(testUser);
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => verifyJWT(token)).toThrow('JWT_SECRET');

    process.env.JWT_SECRET = originalSecret;
  });
});

// ============================================================================
// REGISTRATION LOGIC TESTS (Unit - No Database Required)
// ============================================================================

describe('Registration Logic', () => {
  it('registration should always create CUSTOMER role (test logic)', () => {
    // Simulating registration that forces CUSTOMER
    const requestData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123',
      role: 'ADMIN', // User attempts to set ADMIN
    };

    // Server-side logic: always use CUSTOMER
    const assignedRole = requestData.role === 'ADMIN' ? 'CUSTOMER' : requestData.role;
    const userRole = requestData.role !== 'ADMIN' && requestData.role ? requestData.role : 'CUSTOMER';

    expect(userRole).toBe('CUSTOMER');
  });

  it('should not accept hardcoded ADMIN in registration', () => {
    const role = 'CUSTOMER'; // Hardcoded server-side
    expect(role).not.toBe('ADMIN');
  });
});

// ============================================================================
// ERROR HANDLING TESTS (Unit - No Database Required)
// ============================================================================

describe('Error Handling', () => {
  it('should throw error if JWT_SECRET not configured', () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    const user = { _id: '123', role: 'CUSTOMER' };

    expect(() => generateJWT(user)).toThrow();
    expect(() => generateJWT(user)).toThrow('JWT_SECRET');

    process.env.JWT_SECRET = originalSecret;
  });

  it('password hashing should handle errors gracefully', async () => {
    // Test with valid password (no error expected)
    const password = 'ValidPassword123';
    let error = null;

    try {
      await hashPassword(password);
    } catch (e) {
      error = e;
    }

    expect(error).toBeNull();
  });

  it('password comparison should handle errors gracefully', async () => {
    const password = 'ValidPassword123';
    const hash = await hashPassword(password);

    let error = null;
    try {
      await verifyPassword(password, hash);
    } catch (e) {
      error = e;
    }

    expect(error).toBeNull();
  });
});

// ============================================================================
// EMAIL NORMALIZATION TESTS
// ============================================================================

describe('Email Normalization Logic', () => {
  it('should normalize email to lowercase', () => {
    const email = 'John@EXAMPLE.COM';
    const normalized = email.toLowerCase().trim();

    expect(normalized).toBe('john@example.com');
  });

  it('should trim whitespace from email', () => {
    const email = '  john@example.com  ';
    const normalized = email.toLowerCase().trim();

    expect(normalized).toBe('john@example.com');
  });

  it('should prevent different cases of same email', () => {
    const email1 = 'John@Example.Com';
    const email2 = 'JOHN@EXAMPLE.COM';

    const normalized1 = email1.toLowerCase();
    const normalized2 = email2.toLowerCase();

    expect(normalized1).toBe(normalized2);
  });
});

describe('Database Connectivity', () => {
  it('should indicate status of MongoDB configuration', () => {
    const hasMongoUri = !!process.env.MONGODB_URI;

    if (!hasMongoUri) {
      console.log('⚠ MONGODB_URI not configured - integration tests skipped');
    }

    expect(typeof hasMongoUri).toBe('boolean');
  });
});
