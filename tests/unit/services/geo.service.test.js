/**
 * Unit Tests for Geo Service
 * Tests geographic calculations, distance measurements, and location validation
 */

import { describe, test, expect } from '@jest/globals';
import {
  calculateDistance,
  validateCoordinates,
  isWithinRadius,
  getBoundingBox,
  normalizeCoordinates
} from '../../../src/services/geo.service.js';

describe('Geo Service', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between coordinates correctly', () => {
      // Turku to Helsinki (approximately 165 km)
      const turku = { latitude: 60.4518, longitude: 22.2666 };
      const helsinki = { latitude: 60.1699, longitude: 24.9384 };
      
      const distance = calculateDistance(
        turku.latitude, turku.longitude,
        helsinki.latitude, helsinki.longitude
      );
      
      expect(distance).toBeGreaterThan(160);
      expect(distance).toBeLessThan(170);
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(60.4518, 22.2666, 60.4518, 22.2666);
      expect(distance).toBe(0);
    });

    test('should handle coordinates across the globe', () => {
      // New York to Tokyo (approximately 10,838 km)
      const distance = calculateDistance(40.7128, -74.0060, 35.6762, 139.6503);
      expect(distance).toBeGreaterThan(10800);
      expect(distance).toBeLessThan(10900);
    });

    test('should handle edge cases', () => {
      // North Pole to South Pole (approximately 20,003 km)
      const distance = calculateDistance(90, 0, -90, 0);
      expect(distance).toBeCloseTo(20003, -2);
    });
  });

  describe('validateCoordinates', () => {
    test('should validate correct coordinates', () => {
      expect(validateCoordinates(60.4518, 22.2666)).toBe(true);
      expect(validateCoordinates(0, 0)).toBe(true);
      expect(validateCoordinates(-90, -180)).toBe(true);
      expect(validateCoordinates(90, 180)).toBe(true);
    });

    test('should reject invalid coordinates', () => {
      expect(validateCoordinates(91, 22.2666)).toBe(false); // Latitude > 90
      expect(validateCoordinates(-91, 22.2666)).toBe(false); // Latitude < -90
      expect(validateCoordinates(60.4518, 181)).toBe(false); // Longitude > 180
      expect(validateCoordinates(60.4518, -181)).toBe(false); // Longitude < -180
    });

    test('should handle non-numeric input', () => {
      expect(validateCoordinates('invalid', 22.2666)).toBe(false);
      expect(validateCoordinates(60.4518, 'invalid')).toBe(false);
      expect(validateCoordinates(null, 22.2666)).toBe(false);
      expect(validateCoordinates(60.4518, undefined)).toBe(false);
    });
  });

  describe('isWithinRadius', () => {
    const centerLat = 60.4518;
    const centerLng = 22.2666;
    const radius = 5; // 5 km

    test('should identify points within radius', () => {
      // Point 2 km away (approximately)
      const nearbyLat = 60.4700;
      const nearbyLng = 22.2800;
      
      expect(isWithinRadius(centerLat, centerLng, nearbyLat, nearbyLng, radius))
        .toBe(true);
    });

    test('should identify points outside radius', () => {
      // Point ~10 km away
      const farLat = 60.5200;
      const farLng = 22.3500;
      
      expect(isWithinRadius(centerLat, centerLng, farLat, farLng, radius))
        .toBe(false);
    });

    test('should handle edge cases', () => {
      // Same point
      expect(isWithinRadius(centerLat, centerLng, centerLat, centerLng, radius))
        .toBe(true);
      
      // Zero radius
      expect(isWithinRadius(centerLat, centerLng, centerLat, centerLng, 0))
        .toBe(true);
      
      // Negative radius should be treated as 0
      expect(isWithinRadius(centerLat, centerLng, centerLat, centerLng, -1))
        .toBe(true);
    });
  });

  describe('getBoundingBox', () => {
    test('should calculate correct bounding box', () => {
      const lat = 60.4518;
      const lng = 22.2666;
      const radiusKm = 10;
      
      const bbox = getBoundingBox(lat, lng, radiusKm);
      
      expect(bbox).toHaveProperty('minLat');
      expect(bbox).toHaveProperty('maxLat');
      expect(bbox).toHaveProperty('minLng');
      expect(bbox).toHaveProperty('maxLng');
      
      expect(bbox.minLat).toBeLessThan(lat);
      expect(bbox.maxLat).toBeGreaterThan(lat);
      expect(bbox.minLng).toBeLessThan(lng);
      expect(bbox.maxLng).toBeGreaterThan(lng);
    });

    test('should handle edge coordinates', () => {
      // Near North Pole
      const bbox1 = getBoundingBox(89, 0, 100);
      expect(bbox1.maxLat).toBeLessThanOrEqual(90);
      
      // Near South Pole
      const bbox2 = getBoundingBox(-89, 0, 100);
      expect(bbox2.minLat).toBeGreaterThanOrEqual(-90);
    });
  });

  describe('normalizeCoordinates', () => {
    test('should normalize coordinates correctly', () => {
      const result1 = normalizeCoordinates('60.4518', '22.2666');
      expect(result1.latitude).toBe(60.4518);
      expect(result1.longitude).toBe(22.2666);
      
      const result2 = normalizeCoordinates(60.4518, 22.2666);
      expect(result2.latitude).toBe(60.4518);
      expect(result2.longitude).toBe(22.2666);
    });

    test('should handle precision', () => {
      const result = normalizeCoordinates('60.45180000', '22.26660000');
      expect(result.latitude).toBeCloseTo(60.4518, 6);
      expect(result.longitude).toBeCloseTo(22.2666, 6);
    });

    test('should throw error for invalid coordinates', () => {
      expect(() => normalizeCoordinates('invalid', '22.2666'))
        .toThrow('Invalid coordinates');
      expect(() => normalizeCoordinates('91', '22.2666'))
        .toThrow('Invalid coordinates');
    });
  });

  describe('Integration Tests', () => {
    test('should work with real-world store locations', () => {
      // Test stores in Turku area
      const stores = [
        { lat: 60.4518, lng: 22.2666, name: 'Store A' },
        { lat: 60.4600, lng: 22.2800, name: 'Store B' },
        { lat: 60.5000, lng: 22.3000, name: 'Store C' }
      ];
      
      const searchPoint = { lat: 60.4518, lng: 22.2666 };
      const radius = 5;
      
      const nearbyStores = stores.filter(store => 
        isWithinRadius(
          searchPoint.lat, searchPoint.lng,
          store.lat, store.lng,
          radius
        )
      );
      
      expect(nearbyStores).toHaveLength(2); // Store A and B should be within 5km
      expect(nearbyStores.find(s => s.name === 'Store A')).toBeDefined();
      expect(nearbyStores.find(s => s.name === 'Store B')).toBeDefined();
    });
  });
});