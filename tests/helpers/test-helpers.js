/**
 * Test Helper Functions
 * Utility functions for test setup, mocking, and assertions
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../../src/db/prisma.js';

/**
 * Database Test Helpers
 */
export class DatabaseHelpers {
  /**
   * Clean all test data from database
   */
  static async cleanDatabase() {
    try {
      // Clean in reverse order of dependencies
      await prisma.auditLog.deleteMany();
      await prisma.discount.deleteMany();
      await prisma.price.deleteMany();
      await prisma.product.deleteMany();
      await prisma.store.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.error('Error cleaning database:', error);
    }
  }

  /**
   * Create a test user
   */
  static async createTestUser(overrides = {}) {
    const userData = {
      email: 'testuser@example.com',
      password: '$2b$04$hash', // Pre-hashed test password
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      ...overrides
    };

    return await prisma.user.create({ data: userData });
  }

  /**
   * Create a test store
   */
  static async createTestStore(overrides = {}) {
    const storeData = {
      name: 'Test Store',
      email: 'teststore@example.com',
      password: '$2b$04$hash',
      status: 'APPROVED',
      latitude: 60.4518,
      longitude: 22.2666,
      address: '123 Test Street',
      phone: '+358401234567',
      website: 'https://teststore.com',
      isActive: true,
      ...overrides
    };

    return await prisma.store.create({ data: storeData });
  }

  /**
   * Create a test product
   */
  static async createTestProduct(overrides = {}) {
    const productData = {
      barcode: '1234567890128',
      barcodeType: 'EAN13',
      name: 'Test Product',
      category: 'test',
      ...overrides
    };

    return await prisma.product.create({ data: productData });
  }

  /**
   * Create a test price
   */
  static async createTestPrice(productId, storeId, overrides = {}) {
    const priceData = {
      productId,
      storeId,
      price: 9.99,
      source: 'STORE_USER',
      latitude: 60.4518,
      longitude: 22.2666,
      isActive: true,
      ...overrides
    };

    return await prisma.price.create({ data: priceData });
  }
}

/**
 * Authentication Test Helpers
 */
export class AuthHelpers {
  /**
   * Generate test JWT token
   */
  static generateTestToken(payload = {}) {
    const defaultPayload = {
      id: 1,
      email: 'test@example.com',
      type: 'user',
      role: 'ADMIN',
      ...payload
    };

    return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Generate store JWT token
   */
  static generateStoreToken(storeId = 1, payload = {}) {
    const defaultPayload = {
      id: storeId,
      email: 'store@example.com',
      type: 'store',
      storeId,
      storeName: 'Test Store',
      ...payload
    };

    return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Generate admin JWT token
   */
  static generateAdminToken(userId = 1, role = 'ADMIN') {
    return this.generateTestToken({
      id: userId,
      role,
      email: 'admin@example.com'
    });
  }

  /**
   * Generate super admin JWT token
   */
  static generateSuperAdminToken(userId = 1) {
    return this.generateAdminToken(userId, 'SUPER_ADMIN');
  }
}

/**
 * HTTP Test Helpers
 */
export class HttpHelpers {
  /**
   * Get authorization header with JWT token
   */
  static getAuthHeader(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Extract error message from response
   */
  static getErrorMessage(response) {
    return response.body?.error || response.body?.message || 'Unknown error';
  }

  /**
   * Assert successful response
   */
  static assertSuccess(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.success).toBe(true);
  }

  /**
   * Assert error response
   */
  static assertError(response, expectedStatus, expectedMessage) {
    expect(response.status).toBe(expectedStatus);
    
    if (expectedMessage) {
      const errorMessage = this.getErrorMessage(response);
      expect(errorMessage).toContain(expectedMessage);
    }
  }
}

/**
 * Mock Data Generators
 */
export class MockData {
  /**
   * Generate mock price observation data
   */
  static generatePriceObservation(overrides = {}) {
    return {
      barcode: '1234567890128',
      barcodeType: 'EAN13',
      price: 9.99,
      latitude: 60.4518,
      longitude: 22.2666,
      productName: 'Test Product',
      timestamp: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generate mock store registration data
   */
  static generateStoreRegistration(overrides = {}) {
    return {
      name: 'Mock Store',
      email: 'mockstore@example.com',
      password: 'MockStore123!',
      address: '456 Mock Street, Mock City',
      latitude: 60.4518,
      longitude: 22.2666,
      phone: '+358407654321',
      website: 'https://mockstore.com',
      ...overrides
    };
  }

  /**
   * Generate mock user registration data
   */
  static generateUserRegistration(overrides = {}) {
    return {
      email: 'mockuser@example.com',
      password: 'MockUser123!',
      firstName: 'Mock',
      lastName: 'User',
      ...overrides
    };
  }

  /**
   * Generate multiple price observations
   */
  static generateMultiplePrices(count = 5, basePrice = 10.00) {
    return Array.from({ length: count }, (_, index) => 
      this.generatePriceObservation({
        barcode: `123456789012${index}`,
        price: basePrice + (index * 0.50),
        latitude: 60.4518 + (index * 0.001),
        longitude: 22.2666 + (index * 0.001)
      })
    );
  }
}

/**
 * Test Environment Helpers
 */
export class TestEnvironment {
  /**
   * Setup test environment
   */
  static async setup() {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
    
    // Clean database before tests
    await DatabaseHelpers.cleanDatabase();
  }

  /**
   * Cleanup test environment
   */
  static async cleanup() {
    // Clean database after tests
    await DatabaseHelpers.cleanDatabase();
    
    // Close database connections
    await prisma.$disconnect();
  }

  /**
   * Reset test environment between tests
   */
  static async reset() {
    await DatabaseHelpers.cleanDatabase();
  }
}

export default {
  DatabaseHelpers,
  AuthHelpers,
  HttpHelpers,
  MockData,
  TestEnvironment
};