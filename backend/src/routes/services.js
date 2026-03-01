'use strict';

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { serviceSchema } = require('../utils/validators');

// GET /api/services/search  (public)
router.get('/search', optionalAuth, serviceController.searchServices);

// GET /api/services/my-services  (prestataire auth)
router.get('/my-services', authenticate, authorize('prestataire'), serviceController.getMyServices);

// GET /api/services  (public)
router.get('/', optionalAuth, serviceController.getServices);

// GET /api/services/:id  (public)
router.get('/:id', optionalAuth, serviceController.getServiceById);

// POST /api/services  (prestataire auth)
router.post(
  '/',
  authenticate,
  authorize('prestataire'),
  validate(serviceSchema),
  serviceController.createService
);

// PUT /api/services/:id  (prestataire auth)
router.put(
  '/:id',
  authenticate,
  authorize('prestataire', 'admin'),
  validate(serviceSchema),
  serviceController.updateService
);

// DELETE /api/services/:id  (prestataire auth)
router.delete(
  '/:id',
  authenticate,
  authorize('prestataire', 'admin'),
  serviceController.deleteService
);

module.exports = router;
