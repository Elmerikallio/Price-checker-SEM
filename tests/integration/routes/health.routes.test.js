/**
 * Integration Tests for Health Routes
 * Tests health check endpoint and system monitoring
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import { TestEnvironment } from '../../helpers/test-helpers.js';

describe('Health Routes Integration Tests', () => {
  beforeAll(async () => {
    await TestEnvironment.setup();
  });

  afterAll(async () => {
    await TestEnvironment.cleanup();
  });

  describe('GET /api/v1/health', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: 'test'
      });
    });

    test('should include database status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.database).toBeDefined();
      expect(response.body.checks.database.status).toMatch(/healthy|unhealthy/);
    });

    test('should include system information', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.system).toBeDefined();
      expect(response.body.system.uptime).toBeGreaterThan(0);
      expect(response.body.system.memory).toBeDefined();
    });

    test('should respond quickly', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should not require authentication', async () => {
      // Test without any authentication headers
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    test('should handle concurrent health checks', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });
  });

  describe('Health Check Content Validation', () => {
    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
    });

    test('should return consistent structure', async () => {
      const response1 = await request(app).get('/api/v1/health');
      const response2 = await request(app).get('/api/v1/health');

      expect(Object.keys(response1.body).sort())
        .toEqual(Object.keys(response2.body).sort());
    });
  });
});