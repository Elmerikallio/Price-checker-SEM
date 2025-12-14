import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Discount Repository - Database operations for Discount model
 */

/**
 * Create new discount
 * @param {Object} discountData - Discount data
 * @returns {Promise<Object>} Created discount
 */
export async function createDiscount(discountData) {
  try {
    return await prisma.discount.create({
      data: discountData,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error creating discount:', error);
    throw error;
  }
}

/**
 * Find discounts by store
 * @param {string} storeId 
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of discounts
 */
export async function findDiscountsByStore(storeId, options = {}) {
  try {
    const {
      includeExpired = false,
      includeInactive = false,
      type
    } = options;

    const now = new Date();

    const whereClause = {
      storeId,
      isActive: includeInactive ? undefined : true,
      ...(type && { type }),
      ...(!includeExpired && {
        startDate: { lte: now },
        endDate: { gte: now }
      })
    };

    return await prisma.discount.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    logger.error('Error finding discounts by store:', error);
    throw error;
  }
}

/**
 * Find active discounts for multiple stores
 * @param {Array} storeIds - Array of store IDs
 * @returns {Promise<Array>} Array of active discounts
 */
export async function findActiveDiscountsByStores(storeIds) {
  try {
    const now = new Date();

    return await prisma.discount.findMany({
      where: {
        storeId: {
          in: storeIds
        },
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        value: 'desc'
      }
    });
  } catch (error) {
    logger.error('Error finding active discounts by stores:', error);
    throw error;
  }
}

/**
 * Update discount
 * @param {string} id - Discount ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated discount
 */
export async function updateDiscount(id, updateData) {
  try {
    return await prisma.discount.update({
      where: { id },
      data: updateData,
      include: {
        store: {
          select: {
            name: true,
            address: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error updating discount:', error);
    throw error;
  }
}

/**
 * Delete discount (soft delete)
 * @param {string} id - Discount ID
 * @returns {Promise<Object>} Updated discount
 */
export async function deleteDiscount(id) {
  try {
    return await prisma.discount.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        description: true,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error deleting discount:', error);
    throw error;
  }
}

/**
 * Find discount by ID
 * @param {string} id - Discount ID
 * @returns {Promise<Object|null>} Discount object or null
 */
export async function findDiscountById(id) {
  try {
    return await prisma.discount.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error finding discount by ID:', error);
    throw error;
  }
}

/**
 * Get all discounts with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Discounts with count
 */
export async function getAllDiscounts(options = {}) {
  try {
    const {
      skip = 0,
      take = 10,
      storeId,
      type,
      isActive = true,
      includeExpired = false
    } = options;

    const now = new Date();

    const whereClause = {
      isActive,
      ...(storeId && { storeId }),
      ...(type && { type }),
      ...(!includeExpired && {
        startDate: { lte: now },
        endDate: { gte: now }
      })
    };

    const [discounts, total] = await Promise.all([
      prisma.discount.findMany({
        where: whereClause,
        skip,
        take,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.discount.count({ where: whereClause })
    ]);

    return { discounts, total };
  } catch (error) {
    logger.error('Error getting all discounts:', error);
    throw error;
  }
}