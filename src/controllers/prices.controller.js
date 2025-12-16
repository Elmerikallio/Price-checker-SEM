import {
  createPriceObservation,
  findPricesByProduct,
  findNearbyPrices,
  getPriceHistory,
  getLatestPricesByStore
} from '../repositories/price.repo.js';
import { findActiveDiscountsByStores } from '../repositories/discount.repo.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Calculate price label based on price distribution
 * @param {number} price - Current price
 * @param {Array} allPrices - All prices for comparison
 * @returns {string} Price label
 */
function priceLabel(price, allPrices) {
  if (allPrices.length === 0) return 'unknown';
  
  const prices = allPrices.map(p => parseFloat(p.amount));
  const sorted = prices.sort((a, b) => a - b);
  const currentPrice = parseFloat(price);
  
  // Find position of current price
  let position = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] <= currentPrice) position = i;
    else break;
  }
  
  const ratio = position / Math.max(sorted.length - 1, 1);

  if (ratio <= 0.1) return 'very inexpensive';
  if (ratio <= 0.3) return 'inexpensive';
  if (ratio <= 0.7) return 'average';
  if (ratio <= 0.9) return 'expensive';
  return 'very expensive';
}

/**
 * Get nearby prices for a product
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getNearbyPrices(req, res, next) {
  try {
    const { barcode, barcodeType = 'EAN13', lat, lng, radius } = req.query;

    if (!barcode || !lat || !lng) {
      throw new HttpError(400, 'Missing required params: barcode, lat, lng');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius) || parseFloat(process.env.DEFAULT_SEARCH_RADIUS_KM) || 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new HttpError(400, 'Invalid latitude or longitude');
    }

    // Get nearby prices
    const prices = await findNearbyPrices(latitude, longitude, barcode, barcodeType, searchRadius);
    
    if (prices.length === 0) {
      return res.json({
        success: true,
        message: 'No prices found for this product in the specified area',
        prices: [],
        searchArea: {
          center: { lat: latitude, lng: longitude },
          radius: searchRadius
        }
      });
    }

    // Get store IDs for discount lookup
    const storeIds = [...new Set(prices.map(p => p.storeId))];
    const activeDiscounts = await findActiveDiscountsByStores(storeIds);
    
    // Create discount lookup map
    const discountMap = activeDiscounts.reduce((acc, discount) => {
      if (!acc[discount.storeId]) acc[discount.storeId] = [];
      acc[discount.storeId].push(discount);
      return acc;
    }, {});

    // Format results with price labels and discounts
    const results = prices.map(price => {
      const storeDiscounts = discountMap[price.storeId] || [];
      const priceValue = parseFloat(price.amount);
      
      return {
        id: price.id,
        store: {
          id: price.store.id,
          name: price.store.name,
          location: {
            lat: parseFloat(price.store.latitude),
            lng: parseFloat(price.store.longitude)
          },
          distance: price.distance
        },
        product: {
          barcode: price.product.barcode,
          barcodeType: price.product.barcodeType,
          name: price.product.name
        },
        price: priceValue,
        label: priceLabel(priceValue, prices),
        source: price.source,
        observedAt: price.observedAt,
        discounts: storeDiscounts.map(d => ({
          id: d.id,
          type: d.type,
          value: parseFloat(d.value),
          description: d.description,
          validUntil: d.endDate
        }))
      };
    });

    res.json({
      success: true,
      prices: results,
      searchArea: {
        center: { lat: latitude, lng: longitude },
        radius: searchRadius
      },
      summary: {
        total: results.length,
        priceRange: {
          min: Math.min(...results.map(r => r.price)),
          max: Math.max(...results.map(r => r.price))
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Report a new price observation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function submitObservation(req, res, next) {
  try {
    const {
      barcode,
      barcodeType,
      productName,
      storeId,
      price,
      currency,
      latitude,
      longitude
    } = req.body;

    const user = req.user; // From auth middleware
    
    // Determine source based on user type
    const source = user?.type === 'store' ? 'STORE_API' : 'USER_REPORTED';
    
    // If user is a store, verify they're reporting for their own store
    if (user?.type === 'store' && user.storeId !== storeId) {
      throw new HttpError(403, 'Stores can only report prices for their own location');
    }

    const priceObservation = await createPriceObservation({
      barcode,
      barcodeType,
      productName,
      storeId,
      price,
      currency,
      latitude,
      longitude,
      source,
      confidence: user?.type === 'store' ? 1.0 : 0.8 // Higher confidence for store-reported prices
    });

    // Log the price observation
    await prisma.auditLog.create({
      data: {
        userId: user?.type === 'user' ? user.id : null,
        storeId: user?.type === 'store' ? user.id : storeId,
        action: 'PRICE_REPORTED',
        resource: 'Price',
        details: {
          productBarcode: barcode,
          storeId: storeId,
          price: price,
          source: source
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Price observation created:', {
      id: priceObservation.id,
      barcode: barcode,
      storeId: storeId,
      price: price,
      reportedBy: user?.type || 'anonymous'
    });

    res.status(201).json({
      success: true,
      message: 'Price observation recorded successfully',
      priceObservation: {
        id: priceObservation.id,
        product: priceObservation.product,
        store: priceObservation.store,
        price: parseFloat(priceObservation.amount),
        source: priceObservation.source,
        observedAt: priceObservation.observedAt
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get price history for a product
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getProductPriceHistory(req, res, next) {
  try {
    const { barcode, barcodeType = 'EAN13' } = req.params;
    const { storeId, days = 30 } = req.query;

    if (storeId) {
      // Get history for specific store
      const product = await prisma.product.findUnique({
        where: {
          barcode_barcodeType: { barcode, barcodeType }
        }
      });

      if (!product) {
        throw new HttpError(404, 'Product not found');
      }

      const history = await getPriceHistory(product.id, storeId, parseInt(days));
      
      res.json({
        success: true,
        product: {
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          name: product.name
        },
        history
      });
    } else {
      // Get all prices for product
      const prices = await findPricesByProduct(barcode, barcodeType, {
        limit: parseInt(days) * 5, // Roughly estimate based on days
        sortBy: 'observedAt',
        sortOrder: 'desc'
      });

      res.json({
        success: true,
        product: prices.length > 0 ? {
          barcode: prices[0].product.barcode,
          barcodeType: prices[0].product.barcodeType,
          name: prices[0].product.name
        } : null,
        prices
      });
    }

  } catch (error) {
    next(error);
  }
}

/**
 * Get latest prices for authenticated store
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getStorePrices(req, res, next) {
  try {
    const user = req.user; // From auth middleware
    
    if (user.type !== 'store') {
      throw new HttpError(403, 'Store authentication required');
    }

    const { limit = 20 } = req.query;
    
    const prices = await getLatestPricesByStore(user.storeId, parseInt(limit));

    res.json({
      success: true,
      store: {
        id: user.storeId,
        name: user.storeName
      },
      prices: prices.map(price => ({
        id: price.id,
        product: price.product,
        price: parseFloat(price.amount),
        source: price.source,
        observedAt: price.observedAt
      }))
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Submit batch price observations (Store-only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function submitBatchObservations(req, res, next) {
  try {
    const { user } = req;
    const { observations } = req.body;

    // Validate batch size
    if (!Array.isArray(observations)) {
      throw new HttpError(400, 'Observations must be an array', 'VALIDATION_ERROR');
    }

    if (observations.length === 0) {
      throw new HttpError(400, 'At least one observation is required', 'VALIDATION_ERROR');
    }

    if (observations.length > 100) {
      throw new HttpError(400, 'Maximum batch size is 100 observations', 'VALIDATION_ERROR');
    }

    let processed = 0;
    let errors = [];

    for (const obs of observations) {
      try {
        // Create the price observation
        await createPriceObservation({
          barcode: obs.barcode,
          barcodeType: obs.barcodeType || 'EAN13',
          productName: obs.productName,
          amount: obs.amount,
          latitude: obs.latitude,
          longitude: obs.longitude,
          source: 'store_upload',
          storeId: user.storeId,
          metadata: obs.metadata || {}
        });
        processed++;
      } catch (error) {
        errors.push({
          observation: obs,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Batch processing completed. ${processed} observations processed.`,
      processed,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    next(error);
  }
}