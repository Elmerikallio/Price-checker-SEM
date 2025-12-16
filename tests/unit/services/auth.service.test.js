/**
 * Unit Tests for Auth Service
 * Tests authentication logic, password hashing, and token management
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePassword,
  generateResetToken
} from '../../../src/services/auth.service.js';

// Mock bcrypt for consistent testing
jest.mock('bcrypt');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    test('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = 'hashed_password';
      
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      const result = await hashPassword(password);
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 4); // Test rounds
      expect(result).toBe(hashedPassword);
    });

    test('should handle hashing errors', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));
      
      await expect(hashPassword('password'))
        .rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    test('should compare passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = 'hashed_password';
      
      bcrypt.compare.mockResolvedValue(true);
      
      const result = await comparePassword(password, hashedPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      
      const result = await comparePassword('wrong', 'hashed_password');
      
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate JWT token correctly', () => {
      const payload = {
        id: 1,
        email: 'test@example.com',
        role: 'ADMIN'
      };
      
      const token = generateToken(payload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      
      // Verify token contains correct payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('should include expiration time', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    test('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid.token.here'))
        .toThrow();
    });

    test('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      
      expect(() => verifyToken(expiredToken))
        .toThrow('Token expired');
    });
  });

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MySecure@Pass1',
        'Complex#Password9'
      ];
      
      strongPasswords.forEach(password => {
        expect(validatePassword(password).isValid).toBe(true);
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase, numbers, or symbols
        '12345678', // Only numbers
        'PASSWORD', // Only uppercase
        'Pass1!', // Too short
        'password123', // No symbols or uppercase
        'PASSWORD!', // No numbers or lowercase
      ];
      
      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should provide specific validation errors', () => {
      const result = validatePassword('weak');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('generateResetToken', () => {
    test('should generate password reset token', () => {
      const userId = 1;
      const token = generateResetToken(userId);
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
      
      // Verify token contains user ID and is short-lived
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      expect(decoded.type).toBe('password_reset');
      expect(decoded.exp).toBeDefined();
    });

    test('should create time-limited tokens', () => {
      const userId = 1;
      const token = generateResetToken(userId);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeDifference = expirationTime - currentTime;
      
      // Should expire in approximately 15 minutes (900000ms)
      expect(timeDifference).toBeGreaterThan(800000); // At least 13+ minutes
      expect(timeDifference).toBeLessThan(1000000); // Less than 17 minutes
    });
  });

  describe('Integration Tests', () => {
    test('should complete password registration workflow', async () => {
      const password = 'SecurePassword123!';
      
      // Validate password
      const validation = validatePassword(password);
      expect(validation.isValid).toBe(true);
      
      // Hash password
      bcrypt.hash.mockResolvedValue('hashed_password');
      const hashedPassword = await hashPassword(password);
      
      // Compare password
      bcrypt.compare.mockResolvedValue(true);
      const isMatch = await comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
      
      // Generate token
      const payload = { id: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      
      // Verify token
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
    });
  });
});