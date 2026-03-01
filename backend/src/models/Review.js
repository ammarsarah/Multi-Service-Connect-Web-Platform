'use strict';

const { query } = require('../config/database');

const Review = {
  /**
   * Create a new review.
   */
  async create(data) {
    const { reviewer_id, provider_id, request_id, rating, comment } = data;
    const result = await query(
      `INSERT INTO reviews (reviewer_id, provider_id, request_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [reviewer_id, provider_id, request_id || null, rating, comment || null]
    );
    return result.rows[0];
  },

  /**
   * Get all reviews for a provider.
   */
  async findByProviderId(providerId) {
    const result = await query(
      `SELECT rv.*,
              u.name AS reviewer_name, u.avatar AS reviewer_avatar
       FROM reviews rv
       JOIN users u ON u.id = rv.reviewer_id
       WHERE rv.provider_id = $1
       ORDER BY rv.created_at DESC`,
      [providerId]
    );
    return result.rows;
  },

  /**
   * Get all reviews written by a client.
   */
  async findByClientId(clientId) {
    const result = await query(
      `SELECT rv.*,
              p.name AS provider_name, p.avatar AS provider_avatar
       FROM reviews rv
       JOIN users p ON p.id = rv.provider_id
       WHERE rv.reviewer_id = $1
       ORDER BY rv.created_at DESC`,
      [clientId]
    );
    return result.rows;
  },

  /**
   * Compute the average rating for a provider.
   */
  async getAverageRating(providerId) {
    const result = await query(
      `SELECT
         COALESCE(AVG(rating), 0) AS avg_rating,
         COUNT(*) AS review_count
       FROM reviews
       WHERE provider_id = $1`,
      [providerId]
    );
    return result.rows[0];
  },

  /**
   * Find a review by primary key.
   */
  async findById(id) {
    const result = await query(`SELECT * FROM reviews WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  /**
   * Hard-delete a review (admin only).
   */
  async delete(id) {
    const result = await query(`DELETE FROM reviews WHERE id = $1 RETURNING id`, [id]);
    return result.rows[0] || null;
  },

  /**
   * Check whether a reviewer has already reviewed a provider for a given request.
   */
  async existsByRequestAndReviewer(requestId, reviewerId) {
    const result = await query(
      `SELECT id FROM reviews WHERE request_id = $1 AND reviewer_id = $2`,
      [requestId, reviewerId]
    );
    return result.rows.length > 0;
  },
};

module.exports = Review;
