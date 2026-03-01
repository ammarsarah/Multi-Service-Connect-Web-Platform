'use strict';

const { Review, Request, User } = require('../models');
const { formatResponse } = require('../utils/helpers');

/**
 * POST /api/reviews  (client, after completed request)
 */
const createReview = async (req, res, next) => {
  try {
    const { provider_id, request_id, rating, comment } = req.body;

    // If tied to a request, verify ownership & completion
    if (request_id) {
      const serviceRequest = await Request.findById(request_id);
      if (!serviceRequest) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (serviceRequest.client_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      if (serviceRequest.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Request must be completed to leave a review' });
      }

      const alreadyReviewed = await Review.existsByRequestAndReviewer(request_id, req.user.id);
      if (alreadyReviewed) {
        return res.status(409).json({ success: false, message: 'You have already reviewed this request' });
      }
    }

    // Verify provider exists
    const provider = await User.findById(provider_id);
    if (!provider || provider.role !== 'prestataire') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const review = await Review.create({
      reviewer_id: req.user.id,
      provider_id,
      request_id,
      rating,
      comment,
    });

    return res.status(201).json(formatResponse(review, 'Review submitted'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/provider/:providerId  (public)
 */
const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByProviderId(req.params.providerId);
    const avgRating = await Review.getAverageRating(req.params.providerId);
    return res.json(formatResponse({ reviews, ...avgRating }, 'Provider reviews retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reviews/:id  (admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const deleted = await Review.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
    return res.json(formatResponse(null, 'Review deleted'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/my-reviews  (authenticated)
 */
const getMyReviews = async (req, res, next) => {
  try {
    let reviews;
    if (req.user.role === 'prestataire') {
      reviews = await Review.findByProviderId(req.user.id);
    } else {
      reviews = await Review.findByClientId(req.user.id);
    }
    return res.json(formatResponse(reviews, 'Reviews retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getProviderReviews, deleteReview, getMyReviews };
