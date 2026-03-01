'use strict';

const { OpenAI } = require('openai');
const { query } = require('../config/database');
const { FraudLog } = require('../models');
const { calculateDistance } = require('../utils/helpers');
const logger = require('../config/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Score a provider using a weighted multi-factor algorithm.
 * Score = 0.3×avg_rating + 0.25×availability + 0.2×distance_score + 0.25×success_rate
 *
 * @param {object} provider - Provider record with metrics
 * @param {object|null} clientLocation - { lat, lon }
 * @returns {number} score 0-5
 */
const scoringAlgorithm = (provider, clientLocation = null) => {
  // avg_rating is 0-5, normalise to 0-1
  const ratingScore = (parseFloat(provider.avg_rating) || 0) / 5;

  // availability: 1 if has availability set, 0.5 otherwise
  const availabilityScore = provider.availability ? 1.0 : 0.5;

  // distance_score: 1 if unknown, decays with distance (max 100 km)
  let distanceScore = 1.0;
  if (clientLocation && provider.latitude && provider.longitude) {
    const dist = calculateDistance(
      clientLocation.lat,
      clientLocation.lon,
      parseFloat(provider.latitude),
      parseFloat(provider.longitude)
    );
    distanceScore = Math.max(0, 1 - dist / 100);
  }

  // success_rate: completed / total requests, default 0.5
  const total = parseInt(provider.total_requests, 10) || 0;
  const completed = parseInt(provider.completed_requests, 10) || 0;
  const successRate = total > 0 ? completed / total : 0.5;

  const score =
    0.3 * ratingScore +
    0.25 * availabilityScore +
    0.2 * distanceScore +
    0.25 * successRate;

  return Math.round(score * 100) / 100; // rounded to 2 decimal places
};

/**
 * Detect fraudulent patterns for a user/transaction.
 * @returns {{ isFraud: boolean, riskScore: number, reasons: string[] }}
 */
const fraudDetection = async (userId, transactionData) => {
  const reasons = [];
  let riskScore = 0;

  try {
    // 1. Anomalous amount (> 3× user average)
    const avgResult = await query(
      `SELECT COALESCE(AVG(amount), 0) AS avg_amount FROM transactions WHERE client_id = $1`,
      [userId]
    );
    const avgAmount = parseFloat(avgResult.rows[0].avg_amount);
    if (avgAmount > 0 && transactionData.amount > 3 * avgAmount) {
      reasons.push('Transaction amount is more than 3× the user average');
      riskScore += 30;
    }

    // 2. High cancellation rate (> 50%)
    const cancelResult = await query(
      `SELECT
         COUNT(*) AS total,
         COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
       FROM service_requests WHERE client_id = $1`,
      [userId]
    );
    const { total, cancelled } = cancelResult.rows[0];
    if (parseInt(total, 10) > 5 && parseInt(cancelled, 10) / parseInt(total, 10) > 0.5) {
      reasons.push('Cancellation rate exceeds 50%');
      riskScore += 25;
    }

    // 3. Transaction frequency (> 10 in the last hour)
    const freqResult = await query(
      `SELECT COUNT(*) AS count FROM transactions
       WHERE client_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [userId]
    );
    if (parseInt(freqResult.rows[0].count, 10) > 10) {
      reasons.push('More than 10 transactions in the last hour');
      riskScore += 35;
    }

    // 4. New account with large transaction
    const userResult = await query(
      `SELECT created_at FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rows[0]) {
      const accountAgeDays =
        (Date.now() - new Date(userResult.rows[0].created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (accountAgeDays < 7 && transactionData.amount > 500) {
        reasons.push('New account (<7 days) with transaction above $500');
        riskScore += 20;
      }
    }

    const isFraud = riskScore >= 50;

    // Persist log if suspicious
    if (riskScore > 0) {
      await FraudLog.create({
        user_id: userId,
        type: isFraud ? 'fraud_detected' : 'suspicious_activity',
        details: { reasons, transactionData },
        risk_score: riskScore,
      });
    }

    return { isFraud, riskScore, reasons };
  } catch (error) {
    logger.error('Fraud detection error', { error: error.message, userId });
    return { isFraud: false, riskScore: 0, reasons: [] };
  }
};

/**
 * OpenAI-powered chatbot for the platform.
 */
const chatbotService = async (message, userId, conversationHistory = []) => {
  const systemPrompt = `You are a helpful and friendly assistant for the Multi-Service Connect platform — a marketplace connecting clients with service providers. 

You help users with:
- Finding services: explain how to search and filter by category, location, and rating
- Payments: explain the secure Stripe-based payment system and 10% platform commission
- Becoming a provider: explain registration, profile setup, and service creation
- Requests: how clients request services and providers accept/reject them
- Reviews: how to leave reviews after completing a service
- Account management: profile updates, password reset, notifications
- General troubleshooting

Always be concise, helpful, and professional. If you don't know something, say so.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // keep last 10 turns for context window
    { role: 'user', content: message },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

/**
 * Find and rank providers for a given service category.
 */
const matchingService = async (serviceOrCategoryId, clientLocation = null) => {
  try {
    // Try to find by service first, fall back to category
    let categoryId = serviceOrCategoryId;
    if (serviceOrCategoryId) {
      const serviceResult = await query(
        `SELECT category_id FROM services WHERE id = $1 AND is_active = true`,
        [serviceOrCategoryId]
      );
      if (serviceResult.rows[0]) {
        categoryId = serviceResult.rows[0].category_id;
      }
    }

    const conditions = [`u.role = 'prestataire'`, `u.is_active = true`, `u.is_banned = false`];
    const values = [];
    let idx = 1;

    if (categoryId) {
      conditions.push(`s.category_id = $${idx++}`);
      values.push(categoryId);
    }

    const result = await query(
      `SELECT DISTINCT
         u.id, u.name, u.email, u.avatar, u.bio, u.location, u.skills,
         s.availability, s.price,
         COALESCE(AVG(rv.rating), 0) AS avg_rating,
         COUNT(DISTINCT rv.id) AS review_count,
         COUNT(DISTINCT sr.id) AS total_requests,
         COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) AS completed_requests,
         NULL::numeric AS latitude, NULL::numeric AS longitude
       FROM users u
       LEFT JOIN services s ON s.provider_id = u.id AND s.is_active = true
       LEFT JOIN reviews rv ON rv.provider_id = u.id
       LEFT JOIN service_requests sr ON sr.service_id = s.id
       WHERE ${conditions.join(' AND ')}
       GROUP BY u.id, s.availability, s.price`,
      values
    );

    const scored = result.rows.map((provider) => ({
      ...provider,
      score: scoringAlgorithm(provider, clientLocation),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20); // top 20 providers
  } catch (error) {
    logger.error('Matching service error', { error: error.message });
    return [];
  }
};

module.exports = {
  scoringAlgorithm,
  fraudDetection,
  chatbotService,
  matchingService,
};
