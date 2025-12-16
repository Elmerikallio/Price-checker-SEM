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
        status: 'ok',
        timestamp: expect.any(String),
        uptimeSeconds: expect.any(Number)
      });
    });

    test('should include basic health information', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.uptimeSeconds).toBeGreaterThan(0);
      expect(response.body.timestamp).toBeDefined();
    });

    test('should include uptime information', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.uptimeSeconds).toBeGreaterThan(0);
      expect(typeof response.body.uptimeSeconds).toBe('number');
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

      expect(response.body.status).toBe('ok');
    });

    test('should handle concurrent health checks', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
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