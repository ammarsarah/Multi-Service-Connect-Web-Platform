'use strict';

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { requestSchema } = require('../utils/validators');
const Joi = require('joi');

const statusSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'cancelled', 'completed')
    .required(),
});

// POST /api/requests  (client)
router.post(
  '/',
  authenticate,
  authorize('client'),
  validate(requestSchema),
  requestController.createRequest
);

// GET /api/requests  (own)
router.get('/', authenticate, requestController.getMyRequests);

// GET /api/requests/:id
router.get('/:id', authenticate, requestController.getRequestById);

// PUT /api/requests/:id/status
router.put(
  '/:id/status',
  authenticate,
  validate(statusSchema),
  requestController.updateRequestStatus
);

// PUT /api/requests/:id/complete
router.put(
  '/:id/complete',
  authenticate,
  authorize('prestataire', 'admin'),
  requestController.completeRequest
);

module.exports = router;
