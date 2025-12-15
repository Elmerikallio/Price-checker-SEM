# 🧪 Testing Guide

Complete testing documentation for the Price Checker SEM backend service.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure](#test-infrastructure) 
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Writing Tests](#writing-tests)
6. [Test Utilities](#test-utilities)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Price Checker SEM project includes a comprehensive test suite with **250+ test cases** covering:

- **Unit Tests**: Business logic, services, and utilities
- **Integration Tests**: API endpoints with authentication
- **Mock Data**: Realistic test scenarios and edge cases
- **Test Helpers**: Utilities for database setup and assertions

### Test Statistics

| Category | Files | Test Cases | Purpose |
|----------|-------|------------|---------|
| **Unit Tests** | 4 files | ~205 tests | Service logic, utilities |
| **Integration Tests** | 3 files | ~50 tests | API endpoints, auth flows |
| **Total Coverage** | 7 files | **250+ tests** | Full application testing |

---

## 🏗️ Test Infrastructure

### Dependencies

```json
{
  "jest": "^29.7.0",                    // Testing framework
  "supertest": "^6.3.3",              // HTTP assertions  
  "@babel/core": "^7.24.0",           // ES module transformation
  "@babel/preset-env": "^7.24.0",     // JavaScript compilation
  "@jest/globals": "^29.7.0"          // Jest global utilities
}
```

### Configuration Files

#### [jest.config.js](../jest.config.js)
```javascript
export default {
  preset: 'node',
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ]
};
```

#### [babel.config.json](../babel.config.json)
```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": { "node": "current" },
      "modules": "commonjs"
    }]
  ]
}
```

### Test Setup

#### [tests/setup.js](../tests/setup.js)
Global test configuration and environment setup:
- Environment variables for testing
- Database configuration
- Global test utilities
- Error handling setup

#### [tests/global-setup.js](../tests/global-setup.js)
Jest global setup executed before all tests:
- Test database initialization
- Global mocks and spies
- Performance monitoring setup

#### [tests/global-teardown.js](../tests/global-teardown.js)
Jest global teardown executed after all tests:
- Database cleanup
- Resource cleanup
- Test result reporting

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Generate coverage report  
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Advanced Options

```bash
# Run specific test file
npm test -- tests/unit/services/labeling.service.test.js

# Run tests matching pattern
npm test -- --testNamePattern="barcode validation"

# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage for specific files
npm test -- --coverage --collectCoverageFrom="src/services/**/*.js"

# Update snapshots (if using snapshot testing)
npm test -- --updateSnapshot
```

### Environment Variables

Tests use environment-specific configurations:

```bash
# Test environment variables (automatically set)
NODE_ENV=test
DATABASE_URL="file:./test.db"
JWT_SECRET="test-jwt-secret-key"
```

---

## 📦 Test Categories

### 1. Unit Tests

#### Labeling Service Tests
**File**: [tests/unit/services/labeling.service.test.js](../tests/unit/services/labeling.service.test.js)  
**Test Cases**: 87 tests

```javascript
describe('Labeling Service', () => {
  describe('Barcode Validation', () => {
    // EAN-13 validation (13 tests)
    // UPC-A validation (8 tests) 
    // Invalid barcode handling (6 tests)
  });
  
  describe('Product Name Normalization', () => {
    // Name cleaning (12 tests)
    // Special character handling (8 tests)
    // Language processing (5 tests)
  });
  
  describe('Price Categorization', () => {
    // Price range classification (15 tests)
    // Currency handling (7 tests)
    // Discount calculations (8 tests)
  });
  
  describe('Product Slug Generation', () => {
    // URL-safe slug creation (10 tests)
    // Uniqueness validation (5 tests)
  });
});
```

**Coverage Areas**:
- ✅ Barcode format validation (EAN-13, UPC-A)
- ✅ Product name normalization and cleaning
- ✅ Price categorization algorithms
- ✅ Product slug generation for URLs
- ✅ Product information extraction
- ✅ Error handling and edge cases

#### Geo Service Tests  
**File**: [tests/unit/services/geo.service.test.js](../tests/unit/services/geo.service.test.js)  
**Test Cases**: 52 tests

```javascript
describe('Geo Service', () => {
  describe('Distance Calculations', () => {
    // Haversine formula accuracy (15 tests)
    // Edge cases (poles, antimeridian) (8 tests)
    // Performance benchmarks (5 tests)
  });
  
  describe('Location Filtering', () => {
    // Radius-based filtering (12 tests)
    // Bounding box calculations (7 tests)
    // Real-world scenarios (5 tests)
  });
});
```

**Coverage Areas**:
- ✅ Haversine distance calculations
- ✅ Coordinate validation and normalization
- ✅ Radius-based location filtering
- ✅ Bounding box calculations
- ✅ Geographic edge cases (poles, dateline)

#### Auth Service Tests
**File**: [tests/unit/services/auth.service.test.js](../tests/unit/services/auth.service.test.js)  
**Test Cases**: 41 tests

```javascript
describe('Auth Service', () => {
  describe('Password Management', () => {
    // Hashing and verification (12 tests)
    // Strength validation (8 tests)
    // Reset token generation (6 tests)
  });
  
  describe('JWT Operations', () => {
    // Token generation (8 tests)
    // Token verification (7 tests)
  });
});
```

**Coverage Areas**:
- ✅ Password hashing with bcrypt
- ✅ Password strength validation
- ✅ JWT token generation and verification
- ✅ Reset token creation and validation
- ✅ Authentication workflow testing

#### HTTP Error Tests
**File**: [tests/unit/utils/httpError.test.js](../tests/unit/utils/httpError.test.js)  
**Test Cases**: 25 tests

**Coverage Areas**:
- ✅ Custom error class creation
- ✅ HTTP status code handling
- ✅ Error message formatting
- ✅ Error serialization for APIs

### 2. Integration Tests

#### Auth Routes Tests
**File**: [tests/integration/routes/auth.routes.test.js](../tests/integration/routes/auth.routes.test.js)

```javascript
describe('Auth Routes Integration', () => {
  describe('POST /api/v1/auth/login', () => {
    // Successful user login
    // Successful store login
    // Invalid credentials handling
    // Rate limiting validation
  });
  
  describe('POST /api/v1/auth/register/store', () => {
    // Store registration workflow
    // Validation error handling
    // Duplicate store prevention
  });
  
  describe('Authentication Middleware', () => {
    // JWT token validation
    // Role-based access control
    // Token expiration handling
  });
});
```

#### Prices Routes Tests  
**File**: [tests/integration/routes/prices.routes.test.js](../tests/integration/routes/prices.routes.test.js)

```javascript
describe('Prices Routes Integration', () => {
  describe('POST /api/v1/prices/observe', () => {
    // Price observation submission
    // Geolocation validation
    // Barcode validation
  });
  
  describe('GET /api/v1/prices/nearby', () => {
    // Geographic price queries
    // Radius filtering
    // Response formatting
  });
  
  describe('POST /api/v1/prices/batch', () => {
    // Bulk price uploads (stores only)
    // Authentication validation
    // Data validation
  });
});
```

#### Health Routes Tests
**File**: [tests/integration/routes/health.routes.test.js](../tests/integration/routes/health.routes.test.js)

```javascript
describe('Health Check Integration', () => {
  describe('GET /api/v1/health', () => {
    // Basic health check
    // Response structure validation
    // Performance benchmarking
  });
});
```

---

## ✍️ Writing Tests

### Unit Test Template

```javascript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { YourService } from '../../../src/services/your-service.js';

describe('Your Service', () => {
  let service;

  beforeEach(() => {
    service = new YourService();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('methodName', () => {
    it('should handle valid input correctly', () => {
      // Arrange
      const input = 'test-input';
      const expected = 'expected-output';

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should throw error for invalid input', () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      expect(() => service.methodName(invalidInput))
        .toThrow('Expected error message');
    });
  });
});
```

### Integration Test Template

```javascript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../src/app.js';
import { createTestUser, cleanupTestData } from '../../helpers/test-helpers.js';

describe('API Route Integration', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = generateTestToken(testUser);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/endpoint', () => {
    it('should create resource with valid data', async () => {
      // Arrange
      const requestData = { field: 'value' };

      // Act
      const response = await request(app)
        .post('/api/v1/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          field: 'value'
        })
      });
    });
  });
});
```

### Test Best Practices

#### 1. Test Structure (AAA Pattern)
```javascript
it('should do something specific', () => {
  // Arrange - Set up test data
  const input = 'test-data';
  
  // Act - Execute the function
  const result = functionUnderTest(input);
  
  // Assert - Verify the result  
  expect(result).toBe('expected-output');
});
```

#### 2. Descriptive Test Names
```javascript
// ✅ Good - Specific and descriptive
it('should return 400 when barcode has invalid checksum')

// ❌ Bad - Vague and unclear  
it('should handle bad input')
```

#### 3. Test Independence
```javascript
// Each test should be independent
beforeEach(() => {
  // Reset state for each test
  database.clear();
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllMocks();
});
```

#### 4. Mock External Dependencies
```javascript
import { jest } from '@jest/globals';

// Mock external service
jest.mock('../../../src/services/external-service.js', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked' })
}));
```

---

## 🛠️ Test Utilities

### Test Helpers

**File**: [tests/helpers/test-helpers.js](../tests/helpers/test-helpers.js)

#### Database Helpers
```javascript
// Create test user
export const createTestUser = async (overrides = {}) => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: await bcrypt.hash('testpassword', 10),
      role: 'USER',
      ...overrides
    }
  });
};

// Create test store  
export const createTestStore = async (overrides = {}) => {
  return await prisma.store.create({
    data: {
      name: 'Test Store',
      latitude: 60.4518,
      longitude: 22.2666,
      ...overrides
    }
  });
};

// Cleanup test data
export const cleanupTestData = async () => {
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
};
```

#### Authentication Helpers
```javascript
// Generate JWT token for testing
export const generateTestToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Create authorization header
export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`
});
```

#### Mock Data Generators
```javascript
// Generate price observation data
export const mockPriceObservation = (overrides = {}) => ({
  barcode: '1234567890123',
  price: 9.99,
  latitude: 60.4518,
  longitude: 22.2666,
  storeId: 1,
  ...overrides
});

// Generate store registration data
export const mockStoreRegistration = (overrides = {}) => ({
  name: 'Test Store',
  email: 'store@example.com',
  password: 'securepassword123',
  latitude: 60.4518,
  longitude: 22.2666,
  address: '123 Test Street',
  ...overrides
});
```

#### HTTP Test Utilities
```javascript
// Assert successful response
export const expectSuccess = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(true);
  return response.body.data;
};

// Assert error response
export const expectError = (response, expectedStatus, expectedMessage) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(false);
  expect(response.body.error.message).toContain(expectedMessage);
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. ES Module Import Errors
```bash
# Error: Cannot use import statement outside a module
# Solution: Ensure babel.config.json is properly configured

{
  "presets": [
    ["@babel/preset-env", {
      "targets": { "node": "current" },
      "modules": "commonjs"
    }]
  ]
}
```

#### 2. Database Connection Issues
```bash
# Error: Can't reach database server
# Solution: Ensure test database is configured

# In tests/setup.js
process.env.DATABASE_URL = "file:./test.db";
```

#### 3. JWT Secret Missing
```bash
# Error: JWT_SECRET is required
# Solution: Set test environment variables

# In tests/setup.js
process.env.JWT_SECRET = "test-jwt-secret-key";
```

#### 4. Async Test Timeouts
```javascript
// Solution: Increase timeout for long-running tests
describe('Long running tests', () => {
  jest.setTimeout(10000); // 10 seconds
  
  it('should handle async operation', async () => {
    // Test implementation
  });
});
```

### Performance Issues

#### Slow Test Execution
```bash
# Run tests in parallel (default)
npm test -- --maxWorkers=4

# Run tests serially for debugging
npm test -- --runInBand

# Run only changed tests
npm test -- --onlyChanged
```

#### Memory Usage
```javascript
// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clear module cache for memory-intensive tests
afterEach(() => {
  jest.resetModules();
});
```

### Debugging Tests

#### Enable Debug Logging
```javascript
// In test files
import { logger } from '../../../src/utils/logger.js';

describe('Debug Test', () => {
  beforeEach(() => {
    logger.level = 'debug'; // Enable debug logging
  });
});
```

#### Run Single Test File
```bash
# Debug specific test file
npm test -- tests/unit/services/labeling.service.test.js --verbose
```

#### Use Node.js Debugger
```bash
# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest tests/unit/services/labeling.service.test.js
```

---

## 📊 Coverage Reports

### Generate Coverage
```bash
# Generate HTML coverage report
npm run test:coverage

# Coverage report is generated in: coverage/lcov-report/index.html
```

### Coverage Thresholds
```javascript
// In jest.config.js
export default {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Analysis

Current coverage areas:
- ✅ **Services**: High coverage (85%+)
- ✅ **Routes**: Good coverage (75%+)  
- ✅ **Utilities**: Complete coverage (90%+)
- ⚠️ **Middleware**: Partial coverage (needs improvement)
- ⚠️ **Database Layer**: Basic coverage (could be enhanced)

---

## 🎯 Next Steps

### 1. Enhance Test Coverage
- Add middleware unit tests
- Expand repository layer tests
- Add performance benchmarks

### 2. Test Automation
- CI/CD pipeline integration
- Automated coverage reporting
- Test result notifications

### 3. Advanced Testing
- End-to-end API testing
- Load testing with artillery/k6
- Contract testing with Pact

### 4. Test Maintenance
- Regular test review and updates
- Flaky test identification
- Test performance optimization

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing Guide](https://nodejs.org/api/test.html)

---

**Last Updated**: December 14, 2025  
**Project**: Price Checker SEM - Turku University of Applied Sciences  
**Test Coverage**: 250+ test cases across unit and integration testing