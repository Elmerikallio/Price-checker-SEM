/**
 * Unit Tests for HTTP Error Utility
 * Tests custom error handling and HTTP error responses
 */

import { describe, test, expect } from '@jest/globals';
import { HttpError } from '../../../src/utils/httpError.js';

describe('HttpError Utility', () => {
  describe('HttpError Constructor', () => {
    test('should create error with status and message', () => {
      const error = new HttpError(400, 'Bad Request');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
      expect(error.status).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.name).toBe('HttpError');
    });

    test('should create error with additional details', () => {
      const details = { field: 'email', code: 'INVALID_FORMAT' };
      const error = new HttpError(422, 'Validation failed', details);
      
      expect(error.status).toBe(422);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
    });

    test('should default status to 500', () => {
      const error = new HttpError(undefined, 'Server Error');
      
      expect(error.status).toBe(500);
    });

    test('should default message to "Internal Server Error"', () => {
      const error = new HttpError(500);
      
      expect(error.message).toBe('Internal Server Error');
    });
  });

  describe('Error Properties', () => {
    test('should be serializable to JSON', () => {
      const error = new HttpError(404, 'Not Found', { resource: 'user' });
      
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);
      
      expect(parsed.status).toBe(404);
      expect(parsed.message).toBe('Not Found');
      expect(parsed.details).toEqual({ resource: 'user' });
    });

    test('should have proper error stack', () => {
      const error = new HttpError(500, 'Test Error');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('HttpError');
      expect(error.stack).toContain('Test Error');
    });
  });

  describe('Common HTTP Errors', () => {
    test('should handle 400 Bad Request', () => {
      const error = new HttpError(400, 'Invalid input');
      
      expect(error.status).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    test('should handle 401 Unauthorized', () => {
      const error = new HttpError(401, 'Authentication required');
      
      expect(error.status).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    test('should handle 403 Forbidden', () => {
      const error = new HttpError(403, 'Access denied');
      
      expect(error.status).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    test('should handle 404 Not Found', () => {
      const error = new HttpError(404, 'Resource not found');
      
      expect(error.status).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    test('should handle 422 Unprocessable Entity', () => {
      const error = new HttpError(422, 'Validation failed');
      
      expect(error.status).toBe(422);
      expect(error.message).toBe('Validation failed');
    });

    test('should handle 500 Internal Server Error', () => {
      const error = new HttpError(500, 'Server error');
      
      expect(error.status).toBe(500);
      expect(error.message).toBe('Server error');
    });
  });

  describe('Error Comparison', () => {
    test('should be comparable by status code', () => {
      const error1 = new HttpError(400, 'Error 1');
      const error2 = new HttpError(400, 'Error 2');
      const error3 = new HttpError(500, 'Error 3');
      
      expect(error1.status).toBe(error2.status);
      expect(error1.status).not.toBe(error3.status);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined values', () => {
      const error1 = new HttpError(null, null);
      const error2 = new HttpError(undefined, undefined);
      
      expect(error1.status).toBe(500);
      expect(error1.message).toBe('Internal Server Error');
      expect(error2.status).toBe(500);
      expect(error2.message).toBe('Internal Server Error');
    });

    test('should handle non-standard status codes', () => {
      const error = new HttpError(999, 'Custom error');
      
      expect(error.status).toBe(999);
      expect(error.message).toBe('Custom error');
    });

    test('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new HttpError(400, longMessage);
      
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });
  });
});