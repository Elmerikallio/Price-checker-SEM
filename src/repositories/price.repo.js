import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { getOrCreateProduct, calculateDistance } from '../utils/database.js';

/**
 * Price Repository - Database operations for Price and Product models
 */

/**
 * Create price observation
 * @param {Object} priceData - Price observation data
 * @returns {Promise<Object>} Created price observation
 */
export async function createPriceObservation(priceData) {
  try {
    const {
      barcode,
      barcodeType,
      productName,
      storeId,
      price,
      currency = 'EUR',
      latitude,
      longitude,
      source = 'SHOPPER',
      confidence = 1.0
    } = priceData;

    // Get or create product
    const product = await getOrCreateProduct(barcode, barcodeType, productName);

    // Create price observation
    const priceObservation = await prisma.price.create({
      data: {
        productId: product.id,
        storeId,
        amount: price,
        latitude,
        longitude,
        source,
      },
      include: {
        product: {
          select: {
            id: true,
            barcode: true,
            barcodeType: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    return priceObservation;
  } catch (error) {
    logger.error('Error creating price observation:', error);
    throw error;
  }
}

/**
 * Find prices by product barcode
 * @param {string} barcode 
 * @param {string} barcodeType 
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of price observations
 */
export async function findPricesByProduct(barcode, barcodeType, options = {}) {
  try {
    const {
      limit = 50,
      includeInactive = false,
      sortBy = 'observedAt',
      sortOrder = 'desc'
    } = options;

    return await prisma.price.findMany({
      where: {
        product: {
          barcode,
          barcodeType
        },
        isActive: includeInactive ? undefined : true,
        store: {
          status: 'ACTIVE'
        }
      },
      include: {
        product: {
          select: {
            barcode: true,
            barcodeType: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit
    });
  } catch (error) {
    logger.error('Error finding prices by product:', error);
    throw error;
  }
}

/**
 * Find nearby prices for a product
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} barcode 
 * @param {string} barcodeType 
 * @param {number} radiusKm 
 * @returns {Promise<Array>} Array of nearby prices with distances
 */
export async function findNearbyPrices(latitude, longitude, barcode, barcodeType, radiusKm = 10) {
  try {
    // Get all prices for the product with store locations
    const prices = await prisma.price.findMany({
      where: {
        product: {
          barcode,
          barcodeType
        },
        isActive: true,
        store: {
          status: 'ACTIVE'
        }
      },
      include: {
        product: {
          select: {
            barcode: true,
            barcodeType: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: {
        observedAt: 'desc'
      }
    });

    // Calculate distances and filter by radius
    const nearbyPrices = prices
      .map(price => {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(price.store.latitude),
          parseFloat(price.store.longitude)
        );
        return { ...price, distance };
      })
      .filter(price => price.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyPrices;
  } catch (error) {
    logger.error('Error finding nearby prices:', error);
    throw error;
  }
}

/**
 * Get price history for a product at a specific store
 * @param {string} productId 
 * @param {string} storeId 
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of price observations
 */
export async function getPriceHistory(productId, storeId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.price.findMany({
      where: {
        productId,
        storeId,
        isActive: true,
        observedAt: {
          gte: startDate
        }
      },
      include: {
        product: {
          select: {
            name: true,
            barcode: true,
            barcodeType: true
          }
        },
        store: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        observedAt: 'asc'
      }
    });
  } catch (error) {
    logger.error('Error getting price history:', error);
    throw error;
  }
}

/**
 * Get latest prices for a store
 * @param {string} storeId 
 * @param {number} limit 
 * @returns {Promise<Array>} Array of latest price observations
 */
export async function getLatestPricesByStore(storeId, limit = 20) {
  try {
    return await prisma.price.findMany({
      where: {
        storeId,
        isActive: true
      },
      include: {
        product: {
          select: {
            barcode: true,
            barcodeType: true,
            name: true
          }
        }
      },
      orderBy: {
        observedAt: 'desc'
      },
      take: limit
    });
  } catch (error) {
    logger.error('Error getting latest prices by store:', error);
    throw error;
  }
}

/**
 * Update price observation
 * @param {string} id - Price observation ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated price observation
 */
export async function updatePriceObservation(id, updateData) {
  try {
    return await prisma.price.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            name: true,
            barcode: true,
            barcodeType: true
          }
        },
        store: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error updating price observation:', error);
    throw error;
  }
}

/**
 * Delete price observation (soft delete)
 * @param {string} id - Price observation ID
 * @returns {Promise<Object>} Updated price observation
 */
export async function deletePriceObservation(id) {
  try {
    return await prisma.price.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error deleting price observation:', error);
    throw error;
  }
}