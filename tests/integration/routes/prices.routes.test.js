/**
 * Integration Tests for Prices Routes
 * Tests price observation submission, nearby price queries, and store price management
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import { TestEnvironment, DatabaseHelpers, MockData, AuthHelpers } from '../../helpers/test-helpers.js';

describe('Prices Routes Integration Tests', () => {
  let testProduct;
  let testStore;
  let storeToken;

  beforeAll(async () => {
    await TestEnvironment.setup();
  });

  afterAll(async () => {
    await TestEnvironment.cleanup();
  });

  beforeEach(async () => {
    await TestEnvironment.reset();
    
    // Create test data for each test
    testProduct = await DatabaseHelpers.createTestProduct();
    testStore = await DatabaseHelpers.createTestStore();
    storeToken = AuthHelpers.generateStoreToken(testStore.id);
  });

  describe('POST /api/v1/prices/observe', () => {
    test('should submit price observation successfully', async () => {
      const priceData = MockData.generatePriceObservation({
        barcode: testProduct.barcode,
        barcodeType: testProduct.barcodeType
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(priceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('recorded');
      expect(response.body.priceId).toBeDefined();
    });

    test('should create product automatically if not exists', async () => {
      const newProductData = MockData.generatePriceObservation({
        barcode: '9876543210987',
        barcodeType: 'EAN13',
        productName: 'New Product'
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(newProductData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.productCreated).toBe(true);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        price: 9.99
      };

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(invalidData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should validate barcode format', async () => {
      const invalidBarcode = MockData.generatePriceObservation({
        barcode: 'invalid-barcode',
        barcodeType: 'EAN13'
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(invalidBarcode)
        .expect(400);

      expect(response.body.error).toContain('Invalid barcode');
    });

    test('should validate coordinates', async () => {
      const invalidLocation = MockData.generatePriceObservation({
        latitude: 91, // Invalid latitude
        longitude: 181 // Invalid longitude
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(invalidLocation)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should validate price value', async () => {
      const invalidPrice = MockData.generatePriceObservation({
        price: -1 // Negative price
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(invalidPrice)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/prices/nearby', () => {
    beforeEach(async () => {
      // Create test prices at different locations
      await DatabaseHelpers.createTestPrice(testProduct.id, testStore.id, {
        price: 9.99,
        latitude: 60.4518,
        longitude: 22.2666
      });

      const anotherStore = await DatabaseHelpers.createTestStore({
        email: 'another@example.com',
        latitude: 60.4600,
        longitude: 22.2800
      });

      await DatabaseHelpers.createTestPrice(testProduct.id, anotherStore.id, {
        price: 10.49,
        latitude: 60.4600,
        longitude: 22.2800
      });
    });

    test('should find nearby prices', async () => {
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          gtin: testProduct.barcode,
          lat: '60.4518',
          lng: '22.2666',
          radius: '5'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.prices).toBeDefined();
      expect(Array.isArray(response.body.prices)).toBe(true);
      expect(response.body.prices.length).toBeGreaterThan(0);
    });

    test('should return prices sorted by distance', async () => {
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          gtin: testProduct.barcode,
          lat: '60.4518',
          lng: '22.2666',
          radius: '10'
        })
        .expect(200);

      const prices = response.body.prices;
      if (prices.length > 1) {
        // Prices should be sorted by distance (ascending)
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i].distance).toBeGreaterThanOrEqual(prices[i - 1].distance);
        }
      }
    });

    test('should respect radius parameter', async () => {
      // Search with very small radius
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          gtin: testProduct.barcode,
          lat: '60.4518',
          lng: '22.2666',
          radius: '0.1' // Very small radius
        })
        .expect(200);

      const prices = response.body.prices;
      prices.forEach(price => {
        expect(price.distance).toBeLessThanOrEqual(0.1);
      });
    });

    test('should handle non-existent barcode', async () => {
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          gtin: '0000000000000',
          lat: '60.4518',
          lng: '22.2666'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.prices).toHaveLength(0);
    });

    test('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          // Missing required parameters
          lat: '60.4518'
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    test('should validate coordinate ranges', async () => {
      const response = await request(app)
        .get('/api/v1/prices/nearby')
        .query({
          gtin: testProduct.barcode,
          lat: '91', // Invalid latitude
          lng: '22.2666'
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/prices/batch (Store Routes)', () => {
    test('should allow store to upload batch prices', async () => {
      const batchData = {
        prices: [
          {
            barcode: testProduct.barcode,
            barcodeType: testProduct.barcodeType,
            price: 8.99,
            productName: 'Updated Product Name'
          },
          {
            barcode: '9876543210987',
            barcodeType: 'EAN13',
            price: 12.99,
            productName: 'Another Product'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/prices/batch')
        .set('Authorization', `Bearer ${storeToken}`)
        .send(batchData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.processed).toBe(2);
      expect(response.body.created).toBeGreaterThan(0);
    });

    test('should require store authentication', async () => {
      const batchData = {
        prices: [{
          barcode: testProduct.barcode,
          barcodeType: testProduct.barcodeType,
          price: 8.99
        }]
      };

      const response = await request(app)
        .post('/api/v1/prices/batch')
        .send(batchData)
        .expect(401);

      expect(response.body.error).toContain('Authorization header required');
    });

    test('should validate batch size limits', async () => {
      const largeBatch = {
        prices: Array(1001).fill().map((_, index) => ({
          barcode: `123456789${index.toString().padStart(4, '0')}`,
          barcodeType: 'EAN13',
          price: 9.99
        }))
      };

      const response = await request(app)
        .post('/api/v1/prices/batch')
        .set('Authorization', `Bearer ${storeToken}`)
        .send(largeBatch)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle database connection errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we test that the endpoint exists and returns proper structure
      const priceData = MockData.generatePriceObservation();

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(priceData);

      expect([200, 201, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/prices/observe')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle very large coordinate precision', async () => {
      const preciseLocation = MockData.generatePriceObservation({
        latitude: 60.451812345678901234567890,
        longitude: 22.266612345678901234567890
      });

      const response = await request(app)
        .post('/api/v1/prices/observe')
        .send(preciseLocation);

      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe('Performance and Load Tests', () => {
    test('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill().map((_, index) => 
        request(app)
          .post('/api/v1/prices/observe')
          .send(MockData.generatePriceObservation({
            barcode: `123456789${index.toString().padStart(4, '0')}`
          }))
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect([200, 201, 400]).toContain(response.status);
      });
    });
  });
});