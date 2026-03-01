'use strict';

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { reviewSchema } = require('../utils/validators');

// GET /api/reviews/my-reviews  (authenticated) – before /:id to avoid conflict
router.get('/my-reviews', authenticate, reviewController.getMyReviews);

// GET /api/reviews/provider/:providerId  (public)
router.get('/provider/:providerId', reviewController.getProviderReviews);

// POST /api/reviews  (client)
router.post(
  '/',
  authenticate,
  authorize('client'),
  validate(reviewSchema),
  reviewController.createReview
);

// DELETE /api/reviews/:id  (admin)
router.delete('/:id', authenticate, authorize('admin'), reviewController.deleteReview);

module.exports = router;
