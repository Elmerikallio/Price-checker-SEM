/**
 * Labeling Service
 * Product labeling, barcode validation, and categorization logic
 */

/**
 * Validate barcode based on type
 * @param {string} barcode - The barcode to validate
 * @param {string} barcodeType - Type of barcode (EAN13, UPC_A, etc.)
 * @returns {boolean} True if valid
 */
export function validateBarcode(barcode, barcodeType) {
  if (!barcode || !barcodeType || typeof barcode !== 'string') {
    return false;
  }

  // Remove any non-numeric characters
  const cleanBarcode = barcode.replace(/\D/g, '');
  
  if (cleanBarcode !== barcode) {
    return false; // Contains non-numeric characters
  }

  switch (barcodeType.toUpperCase()) {
    case 'EAN13':
      return validateEAN13(cleanBarcode);
    case 'UPC_A':
      return validateUPCA(cleanBarcode);
    default:
      return false;
  }
}

/**
 * Validate EAN-13 barcode
 * @param {string} barcode - 13-digit EAN barcode
 * @returns {boolean} True if valid
 */
function validateEAN13(barcode) {
  if (barcode.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[12]);
}

/**
 * Validate UPC-A barcode
 * @param {string} barcode - 12-digit UPC-A barcode
 * @returns {boolean} True if valid
 */
function validateUPCA(barcode) {
  if (barcode.length !== 12) return false;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i]);
    sum += (i % 2 === 0) ? digit * 3 : digit;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(barcode[11]);
}

/**
 * Normalize product name
 * @param {string} name - Raw product name
 * @returns {string} Normalized name
 */
export function normalizeProductName(name) {
  if (!name) return '';
  
  return String(name)
    .trim()
    .toLowerCase();
}

/**
 * Categorize price into ranges
 * @param {number} price - Product price
 * @returns {string} Price category
 */
export function categorizePrice(price) {
  if (typeof price !== 'number' || price < 0) {
    return 'invalid';
  }

  if (price <= 1.00) return 'low';
  if (price <= 10.00) return 'medium';
  if (price <= 20.00) return 'high';
  return 'premium';
}

/**
 * Generate URL-friendly slug from product name
 * @param {string} name - Product name
 * @returns {string} URL slug
 */
export function generateProductSlug(name) {
  if (!name || typeof name !== 'string') {
    return 'unnamed-product';
  }

  const slug = name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return slug || 'unnamed-product';
}

/**
 * Extract product information from name
 * @param {string} name - Product name
 * @returns {object} Extracted product info
 */
export function extractProductInfo(name) {
  if (!name) name = 'Unknown Product';

  const normalizedName = normalizeProductName(name);
  const slug = generateProductSlug(name);

  // Extract size information
  const sizePattern = /(\d+(?:\.\d+)?)(ml|l|g|kg|oz|lb|cl)/gi;
  const sizeMatches = name.match(sizePattern) || [];

  // Common brand detection
  const brandPattern = /(coca-cola|pepsi|nestle|unilever|danone|kellogg)/gi;
  const brandMatches = name.match(brandPattern) || [];

  // Basic category detection
  const categories = {
    'beverage': /(cola|juice|water|beer|wine|coffee|tea|soda)/gi,
    'dairy': /(milk|cheese|butter|yogurt|cream)/gi,
    'snack': /(chips|cookie|cracker|nuts|candy)/gi,
    'bakery': /(bread|cake|pastry|biscuit)/gi
  };

  let detectedCategory = 'other';
  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(name)) {
      detectedCategory = category;
      break;
    }
  }

  return {
    name: name.trim(),
    normalizedName,
    slug,
    brand: brandMatches.map(b => b.toLowerCase()),
    size: sizeMatches,
    category: detectedCategory
  };
}

/**
 * Calculate price score compared to other prices
 * @param {number} price - Current price
 * @param {Array} otherPrices - Array of price objects
 * @returns {number} Score from 0-100 (higher = better value)
 */
export function calculatePriceScore(price, otherPrices) {
  if (typeof price !== 'number' || price <= 0) {
    return 0;
  }

  if (!otherPrices || otherPrices.length === 0) {
    return 50; // Neutral score when no comparison data
  }

  const prices = otherPrices.map(p => p.price).filter(p => typeof p === 'number' && p > 0);
  
  if (prices.length === 0) {
    return 50;
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return 100; // All prices are the same
  }

  // Calculate percentile rank (inverse - lower price = higher score)
  const priceRange = maxPrice - minPrice;
  const normalizedPosition = (maxPrice - price) / priceRange;
  
  return Math.round(Math.max(0, Math.min(100, normalizedPosition * 100)));
}

export default {
  validateBarcode,
  normalizeProductName,
  categorizePrice,
  generateProductSlug,
  extractProductInfo,
  calculatePriceScore
};