import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { calculateDistance } from '../utils/database.js';

/**
 * Store Repository - Database operations for Store model
 */

/**
 * Find store by email
 * @param {string} email 
 * @returns {Promise<Object|null>} Store object or null
 */
export async function findStoreByEmail(email) {
  try {
    return await prisma.store.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error finding store by email:', error);
    throw error;
  }
}

/**
 * Find store by ID
 * @param {number} id 
 * @returns {Promise<Object|null>} Store object or null
 */
export async function findStoreById(id) {
  try {
    return await prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error finding store by ID:', error);
    throw error;
  }
}

/**
 * Create new store
 * @param {Object} storeData - Store data
 * @returns {Promise<Object>} Created store object
 */
export async function createStore(storeData) {
  try {
    return await prisma.store.create({
      data: storeData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true,
        status: true,
        createdAt: true
      }
    });
  } catch (error) {
    logger.error('Error creating store:', error);
    throw error;
  }
}

/**
 * Update store
 * @param {string} id - Store ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated store object
 */
export async function updateStore(id, updateData) {
  try {
    return await prisma.store.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true,
        status: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error updating store:', error);
    throw error;
  }
}

/**
 * Find nearby stores
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} Array of nearby stores with distances
 */
export async function findNearbyStores(latitude, longitude, radiusKm = 10) {
  try {
    // Get all active approved stores
    const stores = await prisma.store.findMany({
      where: {
        id: true,
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true
      }
    });

    // Calculate distances and filter by radius
    const nearbyStores = stores
      .map(store => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          parseFloat(store.latitude), 
          parseFloat(store.longitude)
        );
        return { ...store, distance };
      })
      .filter(store => store.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyStores;
  } catch (error) {
    logger.error('Error finding nearby stores:', error);
    throw error;
  }
}

/**
 * Get all stores with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Stores with count
 */
export async function getAllStores(options = {}) {
  try {
    const {
      skip = 0,
      take = 10,
      status = 'ACTIVE',
      search
    } = options;

    const whereClause = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where: whereClause,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          phone: true,
          website: true,
          status: true,
          id: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.store.count({ where: whereClause })
    ]);

    return { stores, total };
  } catch (error) {
    logger.error('Error getting all stores:', error);
    throw error;
  }
}

/**
 * Update store status (for admin approval)
 * @param {number} id - Store ID
 * @param {string} status - New status (APPROVED, REJECTED, LOCKED)
 * @returns {Promise<Object>} Updated store
 */
export async function updateStoreStatus(id, status) {
  try {
    return await prisma.store.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error updating store status:', error);
    throw error;
  }
}

/**
 * Delete store (permanently)
 * @param {number} id - Store ID
 * @returns {Promise<Object>} Deleted store data
 */
export async function deleteStore(id) {
  try {
    // First get the store data before deletion
    const store = await prisma.store.findUnique({
      where: { id }
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Delete in transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Delete all related prices first
      await tx.price.deleteMany({
        where: { storeId: id }
      });

      // Delete all related discounts
      await tx.discount.deleteMany({
        where: { storeId: id }
      });

      // Delete the store (this is the store user account)
      await tx.store.delete({
        where: { id }
      });

      return {
        id: store.id,
        name: store.name,
        status: 'DELETED',
        email: store.email,
        deletedAt: new Date()
      };
    });
  } catch (error) {
    logger.error('Error deleting store:', error);
    throw error;
  }
}
