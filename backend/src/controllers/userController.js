'use strict';

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { User, Review, Service } = require('../models');
const { formatResponse, sanitizeUser, paginate } = require('../utils/helpers');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

/**
 * GET /api/users  (admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, role, is_active, search } = req.query;
    const { limit: lim, offset } = paginate(page, limit);
    const filters = {};
    if (role) filters.role = role;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (search) filters.search = search;

    const { data, total } = await User.getAll(filters, { limit: lim, offset });

    return res.json(
      formatResponse(data.map(sanitizeUser), 'Users retrieved', {
        page: parseInt(page, 10) || 1,
        limit: lim,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json(formatResponse(sanitizeUser(user), 'User retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile  (own)
 */
const updateUser = async (req, res, next) => {
  try {
    const updated = await User.update(req.user.id, req.body);
    if (!updated) return res.status(400).json({ success: false, message: 'No fields to update' });
    return res.json(formatResponse(sanitizeUser(updated), 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/avatar  (own, multipart)
 */
const updateAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updated = await User.update(req.user.id, { avatar: avatarUrl });
      return res.json(formatResponse({ avatar: avatarUrl }, 'Avatar updated'));
    } catch (error) {
      next(error);
    }
  },
];

/**
 * DELETE /api/users/:id  (admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json(formatResponse(null, 'User deactivated'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/provider-profile
 */
const getProviderProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'prestataire') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const services = await Service.findByProviderId(user.id);
    const reviews = await Review.findByProviderId(user.id);
    const avgRating = await Review.getAverageRating(user.id);

    return res.json(
      formatResponse(
        { ...sanitizeUser(user), services, reviews, ...avgRating },
        'Provider profile retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/provider-profile  (prestataire only)
 */
const updateProviderProfile = async (req, res, next) => {
  try {
    const { bio, location, skills } = req.body;
    const updated = await User.update(req.user.id, { bio, location, skills });
    if (!updated) return res.status(400).json({ success: false, message: 'Nothing to update' });
    return res.json(formatResponse(sanitizeUser(updated), 'Provider profile updated'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  deleteUser,
  getProviderProfile,
  updateProviderProfile,
};
