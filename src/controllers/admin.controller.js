import { 
  getAllStores, 
  updateStoreStatus,
  findStoreById,
  deleteStore 
} from '../repositories/store.repo.js';
import { getAllUsers, updateUser, deleteUser, createUser, findUserByEmail } from '../repositories/user.repo.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { HttpError } from '../utils/httpError.js';
import bcrypt from 'bcrypt';

/**
 * Get all stores for admin management
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAllStoresForAdmin(req, res, next) {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const { stores, total } = await getAllStores({
      skip,
      take: parseInt(limit),
      status,
      search,
      isActive: true
    });

    res.json({
      success: true,
      stores,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Approve store user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function approveStoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    // Convert id to integer
    const storeId = parseInt(id, 10);
    if (isNaN(storeId) || storeId <= 0) {
      throw new HttpError(400, 'Invalid store ID');
    }

    const store = await findStoreById(storeId);
    if (!store) {
      throw new HttpError(404, 'Store not found');
    }

    if (store.status === 'ACTIVE') {
      throw new HttpError(400, 'Store is already approved');
    }

    const updatedStore = await updateStoreStatus(storeId, 'ACTIVE');

    // Log the approval action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'STORE_APPROVED',
        targetType: 'STORE',
        targetId: storeId.toString(),
        details: {
          storeName: store.name,
          storeEmail: store.email,
          approvedBy: adminUser.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store approved:', { storeId: id, approvedBy: adminUser.email });

    res.json({
      success: true,
      message: 'Store approved successfully',
      store: updatedStore
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Reject store user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function rejectStoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = req.user;

    // Convert id to integer
    const storeId = parseInt(id, 10);
    if (isNaN(storeId) || storeId <= 0) {
      throw new HttpError(400, 'Invalid store ID');
    }

    const store = await findStoreById(storeId);
    if (!store) {
      throw new HttpError(404, 'Store not found');
    }

    const updatedStore = await updateStoreStatus(storeId, 'REJECTED');

    // Log the rejection action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'STORE_REJECTED',
        targetType: 'STORE',
        targetId: storeId.toString(),
        details: {
          storeName: store.name,
          storeEmail: store.email,
          rejectedBy: adminUser.email,
          reason: reason
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store rejected:', { storeId: storeId, rejectedBy: adminUser.email, reason });

    res.json({
      success: true,
      message: 'Store rejected successfully',
      store: updatedStore
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Suspend store user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function lockStoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = req.user;

    // Convert id to integer
    const storeId = parseInt(id, 10);
    if (isNaN(storeId) || storeId <= 0) {
      throw new HttpError(400, 'Invalid store ID');
    }

    const store = await findStoreById(storeId);
    if (!store) {
      throw new HttpError(404, 'Store not found');
    }

    const updatedStore = await updateStoreStatus(storeId, 'LOCKED');

    // Log the suspension action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'STORE_LOCKED',
        targetType: 'STORE',
        targetId: storeId.toString(),
        details: {
          storeName: store.name,
          storeEmail: store.email,
          lockedBy: adminUser.email,
          reason: reason
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store locked:', { storeId: storeId, lockedBy: adminUser.email, reason });

    res.json({
      success: true,
      message: 'Store locked successfully',
      store: updatedStore
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Reactivate store user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function unlockStoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    // Convert id to integer
    const storeId = parseInt(id, 10);
    if (isNaN(storeId) || storeId <= 0) {
      throw new HttpError(400, 'Invalid store ID');
    }

    const store = await findStoreById(storeId);
    if (!store) {
      throw new HttpError(404, 'Store not found');
    }

    const updatedStore = await updateStoreStatus(storeId, 'ACTIVE');

    // Log the reactivation action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'STORE_UNLOCKED',
        targetType: 'STORE',
        targetId: storeId.toString(),
        details: {
          storeName: store.name,
          storeEmail: store.email,
          reactivatedBy: adminUser.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store reactivated:', { storeId: storeId, reactivatedBy: adminUser.email });

    res.json({
      success: true,
      message: 'Store reactivated successfully',
      store: updatedStore
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Remove store user (soft delete)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function removeStoreUser(req, res, next) {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    // Convert id to integer
    const storeId = parseInt(id, 10);
    if (isNaN(storeId) || storeId <= 0) {
      throw new HttpError(400, 'Invalid store ID');
    }

    const store = await findStoreById(storeId);
    if (!store) {
      throw new HttpError(404, 'Store not found');
    }

    const deletedStore = await deleteStore(storeId);

    // Log the deletion action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'STORE_DELETED',
        targetType: 'STORE',
        targetId: storeId.toString(),
        details: {
          storeName: store.name,
          storeEmail: store.email,
          deletedBy: adminUser.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store deleted:', { storeId: id, deletedBy: adminUser.email });

    res.json({
      success: true,
      message: 'Store removed successfully',
      store: deletedStore
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get audit logs
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      resource,
      userId,
      storeId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      ...(action && { action }),
      ...(resource && { resource }),
      ...(userId && { userId }),
      ...(storeId && { storeId }),
      ...(startDate && endDate && {
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          },
          store: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get system statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getSystemStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalStores,
      pendingStores,
      approvedStores,
      totalProducts,
      totalPrices,
      recentPrices
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.store.count({ where: { isActive: true } }),
      prisma.store.count({ where: { status: 'PENDING', isActive: true } }),
      prisma.store.count({ where: { status: 'APPROVED', isActive: true } }),
      prisma.product.count(),
      prisma.price.count({ where: { isActive: true } }),
      prisma.price.count({
        where: {
          isActive: true,
          observedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers
        },
        stores: {
          total: totalStores,
          pending: pendingStores,
          approved: approvedStores,
          rejected: totalStores - pendingStores - approvedStores
        },
        products: {
          total: totalProducts
        },
        prices: {
          total: totalPrices,
          lastDay: recentPrices
        }
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Create a new admin user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function createAdminUser(req, res, next) {
  try {
    const { email, password, role = 'ADMIN' } = req.body;
    const adminUser = req.user;

    // Validate role
    if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new HttpError(400, 'Invalid role. Must be ADMIN or SUPER_ADMIN');
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new HttpError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin user
    const newUser = await createUser({
      email,
      password: hashedPassword,
      role,
      createdBy: adminUser.id
    });

    // Log the creation action
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_USER_CREATED',
        resource: 'User',
        details: {
          newUserEmail: email,
          newUserRole: role,
          createdBy: adminUser.email
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Admin user created:', { 
      newUserId: newUser.id, 
      newUserEmail: email, 
      role,
      createdBy: adminUser.email 
    });

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: userResponse
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get all products in the system
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getAllProducts(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get all products with aggregated price data
    const products = await prisma.product.findMany({
      skip,
      take,
      select: {
        id: true,
        barcode: true,
        barcodeType: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            prices: true
          }
        },
        prices: {
          where: {
            isActive: true
          },
          select: {
            amount: true,
            observedAt: true,
            source: true,
            store: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            observedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics for each product
    const productsWithStats = products.map(product => {
      const activePrices = product.prices.map(p => p.amount);
      const latestPrice = activePrices.length > 0 ? product.prices[0].amount : null;
      const averagePrice = activePrices.length > 0 
        ? activePrices.reduce((sum, price) => sum + price, 0) / activePrices.length 
        : null;
      const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : null;
      const maxPrice = activePrices.length > 0 ? Math.max(...activePrices) : null;

      return {
        id: product.id,
        barcode: product.barcode,
        barcodeType: product.barcodeType,
        name: product.name || `Product ${product.barcode}`,
        createdAt: product.createdAt,
        priceCount: product._count.prices,
        latestPrice,
        averagePrice: averagePrice ? parseFloat(averagePrice.toFixed(2)) : null,
        minPrice,
        maxPrice,
        recentPrices: product.prices.slice(0, 5).map(p => ({
          amount: p.amount,
          observedAt: p.observedAt,
          source: p.source,
          storeName: p.store?.name
        }))
      };
    });

    // Get total count for pagination
    const totalProducts = await prisma.product.count();

    res.json({
      success: true,
      products: productsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting all products:', error);
    next(error);
  }
}

/**
 * Get comprehensive item report
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getItemReport(req, res, next) {
  try {
    // Get basic counts
    const [totalProducts, totalPrices, totalStores, totalUsers] = await Promise.all([
      prisma.product.count(),
      prisma.price.count({ where: { isActive: true } }),
      prisma.store.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count()
    ]);

    // Get top products by price observation count
    const topProducts = await prisma.product.findMany({
      select: {
        id: true,
        barcode: true,
        barcodeType: true,
        name: true,
        _count: {
          select: {
            prices: {
              where: { isActive: true }
            }
          }
        },
        prices: {
          where: { isActive: true },
          select: {
            amount: true,
            observedAt: true
          },
          orderBy: {
            observedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        prices: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Get recent price activity (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentActivity = await prisma.price.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      select: {
        id: true,
        amount: true,
        source: true,
        observedAt: true,
        createdAt: true,
        product: {
          select: {
            barcode: true,
            barcodeType: true,
            name: true
          }
        },
        store: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Get price distribution statistics
    const allPrices = await prisma.price.findMany({
      where: { isActive: true },
      select: { amount: true }
    });

    const priceAmounts = allPrices.map(p => p.amount);
    let priceDistribution = null;

    if (priceAmounts.length > 0) {
      priceAmounts.sort((a, b) => a - b);
      const min = priceAmounts[0];
      const max = priceAmounts[priceAmounts.length - 1];
      const avg = priceAmounts.reduce((sum, price) => sum + price, 0) / priceAmounts.length;
      const median = priceAmounts.length % 2 === 0
        ? (priceAmounts[Math.floor(priceAmounts.length / 2) - 1] + priceAmounts[Math.floor(priceAmounts.length / 2)]) / 2
        : priceAmounts[Math.floor(priceAmounts.length / 2)];

      priceDistribution = {
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        average: parseFloat(avg.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        count: priceAmounts.length
      };
    }

    // Get store activity statistics
    const storeStats = await prisma.store.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            prices: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: {
        prices: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const report = {
      summary: {
        totalProducts,
        totalPrices,
        totalStores,
        totalUsers,
        generatedAt: new Date().toISOString()
      },
      topProducts: topProducts.map(product => ({
        id: product.id,
        barcode: product.barcode,
        name: product.name || `Product ${product.barcode}`,
        priceObservations: product._count.prices,
        latestPrice: product.prices.length > 0 ? product.prices[0].amount : null,
        lastObserved: product.prices.length > 0 ? product.prices[0].observedAt : null
      })),
      recentActivity: recentActivity.map(price => ({
        id: price.id,
        productBarcode: price.product.barcode,
        productName: price.product.name || `Product ${price.product.barcode}`,
        amount: price.amount,
        source: price.source,
        storeName: price.store?.name || 'Shopper Report',
        observedAt: price.observedAt,
        createdAt: price.createdAt
      })),
      priceDistribution,
      topStores: storeStats.map(store => ({
        id: store.id,
        name: store.name,
        priceReports: store._count.prices
      }))
    };

    res.json({
      success: true,
      report
    });

  } catch (error) {
    logger.error('Error generating item report:', error);
    next(error);
  }
}
