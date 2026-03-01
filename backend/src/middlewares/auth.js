'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Verify JWT from the Authorization header and attach user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }
    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Account is banned' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message });
    next(error);
  }
};

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin', 'prestataire')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required roles: ${roles.join(', ')}`,
    });
  }
  next();
};

/**
 * Optional authentication – populates req.user if a valid token is present
 * but does NOT reject unauthenticated requests.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.is_active && !user.is_banned) {
        req.user = user;
      }
    } catch {
      // silently ignore invalid tokens in optional mode
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate, authorize, optionalAuth };
