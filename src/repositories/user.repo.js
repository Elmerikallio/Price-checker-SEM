import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';

/**
 * User Repository - Database operations for User model
 */

/**
 * Find user by email
 * @param {string} email 
 * @returns {Promise<Object|null>} User object or null
 */
export async function findUserByEmail(email) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error finding user by email:', error);
    throw error;
  }
}

/**
 * Find user by ID
 * @param {string} id 
 * @returns {Promise<Object|null>} User object or null
 */
export async function findUserById(id) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error finding user by ID:', error);
    throw error;
  }
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 */
export async function createUser(userData) {
  try {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(id, updateData) {
  try {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users with pagination
 * @param {number} skip - Records to skip
 * @param {number} take - Records to take
 * @returns {Promise<Object>} Users with count
 */
export async function getAllUsers(skip = 0, take = 10) {
  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    return { users, total };
  } catch (error) {
    logger.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Delete user (soft delete by setting isActive to false)
 * @param {string} id - User ID
 * @returns {Promise<Object>} Updated user object
 */
export async function deleteUser(id) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
}