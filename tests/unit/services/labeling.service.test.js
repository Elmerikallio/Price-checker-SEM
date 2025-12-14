/**
 * Unit Tests for Labeling Service
 * Tests product labeling logic, barcode validation, and price categorization
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  validateBarcode,
  normalizeProductName,
  categorizePrice,
  generateProductSlug,
  extractProductInfo,
  calculatePriceScore
} from '../../../src/services/labeling.service.js';

describe('Labeling Service', () => {
  describe('validateBarcode', () => {
    test('should validate EAN-13 barcodes correctly', () => {
      // Valid EAN-13 barcodes
      expect(validateBarcode('1234567890128', 'EAN13')).toBe(true);
      expect(validateBarcode('5901234123457', 'EAN13')).toBe(true);
      
      // Invalid EAN-13 barcodes
      expect(validateBarcode('1234567890123', 'EAN13')).toBe(false); // Wrong check digit
      expect(validateBarcode('12345678901234', 'EAN13')).toBe(false); // Too long
      expect(validateBarcode('123456789012', 'EAN13')).toBe(false); // Too short
    });

    test('should validate UPC-A barcodes correctly', () => {
      expect(validateBarcode('036000291452', 'UPC_A')).toBe(true);
      expect(validateBarcode('123456789012', 'UPC_A')).toBe(false); // Invalid check digit
      expect(validateBarcode('12345678901', 'UPC_A')).toBe(false); // Too short
    });

    test('should handle invalid barcode types', () => {
      expect(validateBarcode('1234567890128', 'INVALID_TYPE')).toBe(false);
      expect(validateBarcode('1234567890128', null)).toBe(false);
      expect(validateBarcode('1234567890128', undefined)).toBe(false);
    });

    test('should handle invalid input', () => {
      expect(validateBarcode(null, 'EAN13')).toBe(false);
      expect(validateBarcode(undefined, 'EAN13')).toBe(false);
      expect(validateBarcode('', 'EAN13')).toBe(false);
      expect(validateBarcode('abc123', 'EAN13')).toBe(false); // Non-numeric
    });
  });

  describe('normalizeProductName', () => {
    test('should normalize product names correctly', () => {
      expect(normalizeProductName('  Coca-Cola 0.5L  ')).toBe('coca-cola 0.5l');
      expect(normalizeProductName('MILK 1L Fat Free')).toBe('milk 1l fat free');
      expect(normalizeProductName('Bread - Whole Wheat (500g)')).toBe('bread - whole wheat (500g)');
    });

    test('should handle special characters', () => {
      expect(normalizeProductName('Café Latte™ 250ml')).toBe('café latte™ 250ml');
      expect(normalizeProductName('Müsli & Früchte')).toBe('müsli & früchte');
    });

    test('should handle empty or invalid input', () => {
      expect(normalizeProductName('')).toBe('');
      expect(normalizeProductName(null)).toBe('');
      expect(normalizeProductName(undefined)).toBe('');
      expect(normalizeProductName(123)).toBe('123');
    });
  });

  describe('categorizePrice', () => {
    test('should categorize prices correctly', () => {
      expect(categorizePrice(0.99)).toBe('low');
      expect(categorizePrice(5.50)).toBe('medium');
      expect(categorizePrice(15.99)).toBe('high');
      expect(categorizePrice(50.00)).toBe('premium');
    });

    test('should handle edge cases', () => {
      expect(categorizePrice(0)).toBe('low');
      expect(categorizePrice(1.00)).toBe('low');
      expect(categorizePrice(10.00)).toBe('medium');
      expect(categorizePrice(20.00)).toBe('high');
    });

    test('should handle invalid input', () => {
      expect(categorizePrice(-1)).toBe('invalid');
      expect(categorizePrice(null)).toBe('invalid');
      expect(categorizePrice(undefined)).toBe('invalid');
      expect(categorizePrice('not a number')).toBe('invalid');
    });
  });

  describe('generateProductSlug', () => {
    test('should generate valid slugs', () => {
      expect(generateProductSlug('Coca-Cola 0.5L')).toBe('coca-cola-05l');
      expect(generateProductSlug('Milk 1L Fat Free')).toBe('milk-1l-fat-free');
      expect(generateProductSlug('Bread & Butter')).toBe('bread-butter');
    });

    test('should handle special characters and spaces', () => {
      expect(generateProductSlug('Product™ (500g)')).toBe('product-500g');
      expect(generateProductSlug('café/lattè')).toBe('cafe-latte');
      expect(generateProductSlug('100% Pure Juice')).toBe('100-pure-juice');
    });

    test('should handle edge cases', () => {
      expect(generateProductSlug('')).toBe('unnamed-product');
      expect(generateProductSlug('   ')).toBe('unnamed-product');
      expect(generateProductSlug('!!!')).toBe('unnamed-product');
    });
  });

  describe('extractProductInfo', () => {
    test('should extract product information correctly', () => {
      const result = extractProductInfo('Coca-Cola Original 0.5L Bottle');
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('normalizedName');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('brand');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('category');
      
      expect(result.normalizedName).toBe('coca-cola original 0.5l bottle');
      expect(result.slug).toBe('coca-cola-original-05l-bottle');
    });

    test('should extract size information', () => {
      expect(extractProductInfo('Milk 1L').size).toContain('1l');
      expect(extractProductInfo('Bread 500g').size).toContain('500g');
      expect(extractProductInfo('Juice 250ml').size).toContain('250ml');
    });

    test('should detect common brands', () => {
      expect(extractProductInfo('Coca-Cola').brand).toContain('coca-cola');
      expect(extractProductInfo('Pepsi Max').brand).toContain('pepsi');
    });
  });

  describe('calculatePriceScore', () => {
    const mockPrices = [
      { price: 1.99 },
      { price: 2.49 },
      { price: 1.79 },
      { price: 2.99 },
      { price: 2.29 }
    ];

    test('should calculate price scores correctly', () => {
      const score1 = calculatePriceScore(1.79, mockPrices); // Lowest price
      const score2 = calculatePriceScore(2.99, mockPrices); // Highest price
      const score3 = calculatePriceScore(2.29, mockPrices); // Middle price

      expect(score1).toBeGreaterThan(score2); // Lower price = higher score
      expect(score1).toBeGreaterThan(score3);
      expect(score1).toBeGreaterThanOrEqual(0);
      expect(score1).toBeLessThanOrEqual(100);
    });

    test('should handle edge cases', () => {
      expect(calculatePriceScore(1.99, [])).toBe(50); // No comparison data
      expect(calculatePriceScore(1.99, [{ price: 1.99 }])).toBe(100); // Same price
    });

    test('should handle invalid input', () => {
      expect(calculatePriceScore(null, mockPrices)).toBe(0);
      expect(calculatePriceScore(-1, mockPrices)).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    test('should process complete product labeling workflow', () => {
      const productName = '  Coca-Cola Original 0.5L  ';
      const barcode = '1234567890128';
      const barcodeType = 'EAN13';
      const price = 2.49;
      
      // Validate barcode
      const isValidBarcode = validateBarcode(barcode, barcodeType);
      expect(isValidBarcode).toBe(true);
      
      // Extract product info
      const productInfo = extractProductInfo(productName);
      expect(productInfo.normalizedName).toBe('coca-cola original 0.5l');
      
      // Categorize price
      const priceCategory = categorizePrice(price);
      expect(priceCategory).toBe('low');
      
      // Generate slug
      const slug = generateProductSlug(productName);
      expect(slug).toBe('coca-cola-original-05l');
    });
  });
});