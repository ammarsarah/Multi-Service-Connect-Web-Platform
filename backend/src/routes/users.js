'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { updateProfileSchema } = require('../utils/validators');

// GET /api/users  (admin only)
router.get('/', authenticate, authorize('admin'), userController.getUsers);

// GET /api/users/:id/provider-profile  (public)
router.get('/:id/provider-profile', userController.getProviderProfile);

// GET /api/users/:id
router.get('/:id', authenticate, userController.getUserById);

// PUT /api/users/profile  (own)
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateUser);

// PUT /api/users/provider-profile  (prestataire only)
router.put(
  '/provider-profile',
  authenticate,
  authorize('prestataire'),
  userController.updateProviderProfile
);

// PUT /api/users/avatar  (own)
router.put('/avatar', authenticate, ...userController.updateAvatar);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;
