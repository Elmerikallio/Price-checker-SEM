import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repositories/user.repo.js';
import { findStoreByEmail, createStore } from '../repositories/store.repo.js';
import { prisma } from '../db/prisma.js';
import { logger } from '../utils/logger.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE_TIME || '24h' }
  );
}

/**
 * User/Admin login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function login(req, res, next) {
  try {
    const { email, password, userType = 'user' } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    let user;
    let accountType;

    if (userType === 'store') {
      // Store login
      user = await findStoreByEmail(email);
      accountType = 'store';
      
      if (!user) {
        throw new HttpError(401, 'Invalid store credentials');
      }

      if (user.status !== 'ACTIVE') {
        throw new HttpError(401, 'Store account is not approved yet');
      }
    } else {
      // User/Admin login
      user = await findUserByEmail(email);
      accountType = 'user';
      
      if (!user) {
        throw new HttpError(401, 'Invalid user credentials');
      }
    }

    if (!user.isActive) {
      throw new HttpError(401, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      type: accountType,
      ...(accountType === 'user' && { role: user.role }),
      ...(accountType === 'store' && { storeId: user.id, storeName: user.name })
    };

    const token = generateToken(tokenPayload);

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: accountType === 'user' ? user.id : null,
        storeId: accountType === 'store' ? user.id : null,
        action: 'LOGIN',
        resource: accountType === 'user' ? 'User' : 'Store',
        details: {
          email: user.email,
          loginTime: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info(`${accountType} login successful:`, { email: user.email, id: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        type: accountType,
        ...(accountType === 'user' && { 
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role 
        }),
        ...(accountType === 'store' && { 
          name: user.name,
          address: user.address,
          status: user.status 
        })
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Store registration
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function registerStoreSignup(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      address,
      latitude,
      longitude,
      phone,
      website
    } = req.body;

    // Check if store already exists
    const existingStore = await findStoreByEmail(email);
    if (existingStore) {
      throw new HttpError(409, 'Store with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create store
    const newStore = await createStore({
      name,
      email,
      password: hashedPassword,
      address,
      latitude,
      longitude,
      phone,
      website,
      status: 'PENDING'
    });

    // Log store registration
    await prisma.auditLog.create({
      data: {
        storeId: newStore.id,
        action: 'STORE_REGISTRATION',
        resource: 'Store',
        details: {
          storeName: name,
          email: email,
          address: address
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    logger.info('Store registration successful:', { email, name, id: newStore.id });

    res.status(201).json({
      success: true,
      message: 'Store registration successful. Pending admin approval.',
      store: {
        id: newStore.id,
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        status: newStore.status,
        createdAt: newStore.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Logout (client-side token invalidation)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function logout(req, res, next) {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // by removing the token. Here we just log the action.
    
    const user = req.user; // Set by auth middleware
    
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.type === 'user' ? user.id : null,
          storeId: user.type === 'store' ? user.id : null,
          action: 'LOGOUT',
          resource: user.type === 'user' ? 'User' : 'Store',
          details: {
            email: user.email,
            logoutTime: new Date().toISOString()
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      logger.info(`${user.type} logout:`, { email: user.email, id: user.id });
    }

    res.json({
      success: true,
      message: 'Logout successful. Please remove token from client.'
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getProfile(req, res, next) {
  try {
    const user = req.user; // Set by auth middleware

    let profileData;

    if (user.type === 'user') {
      const userData = await findUserByEmail(user.email);
      profileData = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: userData.createdAt
      };
    } else {
      const storeData = await findStoreByEmail(user.email);
      profileData = {
        id: storeData.id,
        name: storeData.name,
        email: storeData.email,
        address: storeData.address,
        phone: storeData.phone,
        website: storeData.website,
        status: storeData.status,
        isActive: storeData.isActive,
        createdAt: storeData.createdAt
      };
    }

    res.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    next(error);
  }
}
