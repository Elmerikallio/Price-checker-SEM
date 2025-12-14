import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';
import { findUserById } from '../repositories/user.repo.js';
import { findStoreById } from '../repositories/store.repo.js';

/**
 * Authentication middleware - Verify JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new HttpError(401, 'Authorization header required');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new HttpError(401, 'Token required');
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new HttpError(401, 'Token expired');
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new HttpError(401, 'Invalid token');
      }
      throw new HttpError(401, 'Token verification failed');
    }

    // Verify user/store still exists and is active
    let user;
    if (decoded.type === 'user') {
      user = await findUserById(decoded.id);
      if (!user || !user.isActive) {
        throw new HttpError(401, 'User account not found or inactive');
      }
    } else if (decoded.type === 'store') {
      user = await findStoreById(decoded.id);
      if (!user || !user.isActive || user.status !== 'APPROVED') {
        throw new HttpError(401, 'Store account not found, inactive, or not approved');
      }
    } else {
      throw new HttpError(401, 'Invalid token type');
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      ...(decoded.type === 'user' && { role: decoded.role }),
      ...(decoded.type === 'store' && { 
        storeId: decoded.storeId,
        storeName: decoded.storeName 
      })
    };

    next();

  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    logger.error('Authentication error:', error);
    next(new HttpError(401, 'Authentication failed'));
  }
}

/**
 * Role-based authorization middleware
 * @param {string|Array} allowedRoles - Required role(s)
 * @returns {Function} Middleware function
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Authentication required');
      }

      if (req.user.type !== 'user') {
        throw new HttpError(403, 'User account required');
      }

      if (!roles.includes(req.user.role)) {
        throw new HttpError(403, `Required role: ${roles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Store authentication middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function requireStore(req, res, next) {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Authentication required');
    }

    if (req.user.type !== 'store') {
      throw new HttpError(403, 'Store account required');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Admin or Super Admin authorization
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function requireAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Authentication required');
    }

    if (req.user.type !== 'user') {
      throw new HttpError(403, 'Admin account required');
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      throw new HttpError(403, 'Admin privileges required');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin only authorization
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function requireSuperAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Authentication required');
    }

    if (req.user.type !== 'user' || req.user.role !== 'SUPER_ADMIN') {
      throw new HttpError(403, 'Super Admin privileges required');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // No token provided, continue without authentication
    }

    // If token is provided, validate it
    await requireAuth(req, res, next);
  } catch (error) {
    // If token validation fails, continue without authentication
    logger.warn('Optional auth failed:', error.message);
    next();
  }
}