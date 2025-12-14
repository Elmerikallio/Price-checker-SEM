/**
 * Integration Tests for Auth Routes
 * Tests complete authentication workflow including login, registration, and token management
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import { TestEnvironment, DatabaseHelpers, MockData } from '../../helpers/test-helpers.js';

describe('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    await TestEnvironment.setup();
  });

  afterAll(async () => {
    await TestEnvironment.cleanup();
  });

  beforeEach(async () => {
    await TestEnvironment.reset();
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login user with valid credentials', async () => {
      // Create test user
      const user = await DatabaseHelpers.createTestUser({
        email: 'logintest@example.com',
        password: '$2b$04$N9qo8uLOickgx2ZMRZoMye.IVhq7ox7K7PXXet3OyGayuQOTu7gBO' // 'password'
      });

      const loginData = {
        email: 'logintest@example.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.type).toBe('user');
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should login store with valid credentials', async () => {
      // Create test store
      const store = await DatabaseHelpers.createTestStore({
        email: 'storelogin@example.com',
        password: '$2b$04$N9qo8uLOickgx2ZMRZoMye.IVhq7ox7K7PXXet3OyGayuQOTu7gBO' // 'password'
      });

      const loginData = {
        email: 'storelogin@example.com',
        password: 'password',
        userType: 'store'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.type).toBe('store');
    });

    test('should reject invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBeFalsy();
      expect(response.body.token).toBeUndefined();
    });

    test('should reject login for inactive user', async () => {
      const user = await DatabaseHelpers.createTestUser({
        email: 'inactive@example.com',
        isActive: false
      });

      const loginData = {
        email: 'inactive@example.com',
        password: 'password'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('deactivated');
    });

    test('should reject login for unapproved store', async () => {
      const store = await DatabaseHelpers.createTestStore({
        email: 'pending@example.com',
        status: 'PENDING'
      });

      const loginData = {
        email: 'pending@example.com',
        password: 'password',
        userType: 'store'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('not approved');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/register-store', () => {
    test('should register new store successfully', async () => {
      const storeData = MockData.generateStoreRegistration({
        email: 'newstore@example.com'
      });

      const response = await request(app)
        .post('/api/v1/auth/register-store')
        .send(storeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered');
      expect(response.body.store.email).toBe(storeData.email);
      expect(response.body.store.status).toBe('PENDING');
    });

    test('should reject duplicate email', async () => {
      const existingStore = await DatabaseHelpers.createTestStore({
        email: 'existing@example.com'
      });

      const storeData = MockData.generateStoreRegistration({
        email: 'existing@example.com'
      });

      const response = await request(app)
        .post('/api/v1/auth/register-store')
        .send(storeData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    test('should validate store data', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        password: '123', // Weak password
        name: '', // Empty name
        latitude: 91 // Invalid latitude
      };

      const response = await request(app)
        .post('/api/v1/auth/register-store')
        .send(invalidData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Authentication Middleware Tests', () => {
    test('should protect routes requiring authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401);

      expect(response.body.error).toContain('Authorization header required');
    });

    test('should accept valid JWT token', async () => {
      const user = await DatabaseHelpers.createTestUser();
      const token = global.testHelpers.generateTestToken({ id: user.id });

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should not get 401 error with valid token
      expect(response.body.error).toBeUndefined();
    });

    test('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(response.body.error).toContain('Invalid token');
    });

    test('should reject expired JWT token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toContain('expired');
    });
  });

  describe('Role-based Access Control', () => {
    test('should allow admin access to admin routes', async () => {
      const admin = await DatabaseHelpers.createTestUser({ role: 'ADMIN' });
      const token = global.testHelpers.generateTestToken({ 
        id: admin.id, 
        role: 'ADMIN' 
      });

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('should allow super admin access to super admin routes', async () => {
      const superAdmin = await DatabaseHelpers.createTestUser({ role: 'SUPER_ADMIN' });
      const token = global.testHelpers.generateTestToken({ 
        id: superAdmin.id, 
        role: 'SUPER_ADMIN' 
      });

      const response = await request(app)
        .delete('/api/v1/admin/stores/1')
        .set('Authorization', `Bearer ${token}`);

      // Should not get 403 forbidden error
      expect(response.status).not.toBe(403);
    });

    test('should restrict store access to store-only routes', async () => {
      const store = await DatabaseHelpers.createTestStore();
      const token = global.testHelpers.generateTestToken({ 
        id: store.id, 
        type: 'store' 
      });

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toContain('Admin account required');
    });
  });
});