import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1  
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get or create a product by barcode
 * @param {string} barcode 
 * @param {string} barcodeType 
 * @param {string} name - Optional product name
 * @returns {Promise<Object>} Product object
 */
export async function getOrCreateProduct(barcode, barcodeType, name = null) {
  try {
    return await prisma.product.upsert({
      where: {
        barcode_barcodeType: {
          barcode,
          barcodeType
        }
      },
      update: {
        name: name || undefined, // Only update if name is provided
      },
      create: {
        barcode,
        barcodeType,
        name,
      }
    });
  } catch (error) {
    logger.error('Error in getOrCreateProduct:', error);
    throw error;
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Initialize database with default data if needed
 */
export async function initializeDatabase() {
  try {
    // Check if we have any admin users
    const adminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' }
    });

    if (adminCount === 0) {
      logger.info('No super admin found, database might need seeding');
      logger.info('Run: npm run db:seed to create initial admin user');
    }

    logger.info('Database initialization check completed');
  } catch (error) {
    logger.error('Database initialization check failed:', error);
  }
}