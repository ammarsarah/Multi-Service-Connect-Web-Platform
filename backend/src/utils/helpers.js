'use strict';

const crypto = require('crypto');

/**
 * Generate a cryptographically random hex token.
 * @param {number} length - Number of bytes (token will be 2× length as hex)
 */
const generateToken = (length = 32) => crypto.randomBytes(length).toString('hex');

/**
 * Convert page/limit query params into SQL OFFSET / LIMIT values.
 * @param {number|string} page  - 1-based page number
 * @param {number|string} limit - Items per page (capped at 100)
 * @returns {{ limit: number, offset: number }}
 */
const paginate = (page = 1, limit = 20) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
  };
};

/**
 * Build a standard API response envelope.
 * @param {*} data - Response payload
 * @param {string} message - Human-readable message
 * @param {object|null} pagination - Optional pagination metadata
 */
const formatResponse = (data, message = 'Success', pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) {
    response.pagination = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    };
  }
  return response;
};

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula.
 * @returns distance in kilometres
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Strip sensitive fields from a user object before sending to the client.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const {
    password_hash,
    refresh_token,
    email_verify_token,
    reset_password_token,
    reset_password_expires,
    ...safe
  } = user;
  return safe;
};

module.exports = {
  generateToken,
  paginate,
  formatResponse,
  calculateDistance,
  sanitizeUser,
};
