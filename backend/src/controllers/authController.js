'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateToken, formatResponse, sanitizeUser } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const logger = require('../config/logger');

/** Generate access + refresh token pair for a user */
const issueTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ email, password, name, role, phone });

    const verifyToken = generateToken(32);
    await User.setEmailVerifyToken(user.id, verifyToken);

    try {
      await sendVerificationEmail({ email: user.email, name: user.name }, verifyToken);
    } catch (emailErr) {
      logger.warn('Failed to send verification email', { error: emailErr.message });
    }

    const { accessToken, refreshToken } = issueTokens(user);
    await User.updateRefreshToken(user.id, refreshToken);

    return res.status(201).json(
      formatResponse(
        { user: sanitizeUser(user), accessToken, refreshToken },
        'Registration successful. Please verify your email.'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const validPassword = await User.verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }
    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Account is banned' });
    }
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
    }

    const { accessToken, refreshToken } = issueTokens(user);
    await User.updateRefreshToken(user.id, refreshToken);

    return res.json(
      formatResponse(
        { user: sanitizeUser(user), accessToken, refreshToken },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findByRefreshToken(token);
    if (!user || user.id !== decoded.id) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });
    }

    const { accessToken, refreshToken: newRefresh } = issueTokens(user);
    await User.updateRefreshToken(user.id, newRefresh);

    return res.json(
      formatResponse({ accessToken, refreshToken: newRefresh }, 'Token refreshed')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    await User.updateRefreshToken(req.user.id, null);
    return res.json(formatResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/verify-email/:token
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findByEmailVerifyToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    if (user.is_verified) {
      return res.json(formatResponse(null, 'Email already verified'));
    }

    await User.setEmailVerified(user.id);
    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      logger.warn('Failed to send welcome email', { error: emailErr.message });
    }

    return res.json(formatResponse(null, 'Email verified successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.json(formatResponse(null, 'If that email exists, a reset link has been sent'));
    }

    const resetToken = generateToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await User.setResetPasswordToken(user.id, resetToken, expires);

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailErr) {
      logger.warn('Failed to send reset email', { error: emailErr.message });
    }

    return res.json(formatResponse(null, 'If that email exists, a reset link has been sent'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    await User.updatePassword(user.id, password);
    await User.updateRefreshToken(user.id, null); // invalidate all sessions

    return res.json(formatResponse(null, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json(formatResponse(sanitizeUser(user), 'Profile retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
};
