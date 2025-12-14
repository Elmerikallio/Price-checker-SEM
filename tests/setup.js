/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
process.env.LOG_LEVEL = 'error'; // Reduce test noise

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test helpers
global.testHelpers = {
  // Generate test user data
  generateUserData: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    ...overrides
  }),

  // Generate test store data
  generateStoreData: (overrides = {}) => ({
    name: 'Test Store',
    email: 'store@example.com',
    password: 'StorePassword123!',
    address: '123 Test Street, Test City',
    latitude: 60.4518,
    longitude: 22.2666,
    phone: '+358401234567',
    website: 'https://teststore.com',
    ...overrides
  }),

  // Generate test price data
  generatePriceData: (overrides = {}) => ({
    barcode: '1234567890123',
    barcodeType: 'EAN13',
    price: 9.99,
    latitude: 60.4518,
    longitude: 22.2666,
    productName: 'Test Product',
    ...overrides
  }),

  // Generate JWT token for testing
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({
      id: 1,
      email: 'test@example.com',
      type: 'user',
      role: 'ADMIN',
      ...payload
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});