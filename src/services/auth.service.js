/**
 * Auth Service
 * Authentication utilities, password hashing, and token management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, rounds);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      throw expiredError;
    }
    throw error;
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid boolean and errors array
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate password reset token
 * @param {number} userId - User ID
 * @returns {string} Reset token
 */
export function generateResetToken(userId) {
  const payload = {
    userId,
    type: 'password_reset'
  };
  
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '15m' }); // Short-lived token
}

/**
 * Generate secure random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return authHeader;
}

/**
 * Check if password has been compromised (basic check)
 * @param {string} password - Password to check
 * @returns {boolean} True if password appears compromised
 */
export function isCommonPassword(password) {
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', '123456789', 'password1', 'abc123'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePassword,
  generateResetToken,
  generateRandomString,
  extractTokenFromHeader,
  isCommonPassword
};