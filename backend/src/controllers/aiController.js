'use strict';

const aiService = require('../services/aiService');
const { FraudLog } = require('../models');
const { formatResponse } = require('../utils/helpers');

/**
 * GET /api/ai/recommendations  (authenticated)
 */
const getRecommendations = async (req, res, next) => {
  try {
    const { category_id, lat, lon } = req.query;
    const clientLocation = lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null;

    const recommendations = await aiService.matchingService(
      category_id || null,
      clientLocation
    );

    return res.json(formatResponse(recommendations, 'Recommendations retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/matching/:serviceId  (authenticated)
 */
const getMatching = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    const clientLocation = lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null;

    const matches = await aiService.matchingService(req.params.serviceId, clientLocation);
    return res.json(formatResponse(matches, 'Matching providers retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/chat  (authenticated)
 */
const chatbot = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const response = await aiService.chatbotService(
      message.trim(),
      req.user.id,
      conversationHistory
    );

    return res.json(formatResponse({ reply: response }, 'Chatbot response'));
  } catch (error) {
    next(error);
  }
};

/**
 * Internal – called by transaction/request creation routes.
 * Not exposed as a route directly.
 */
const analyzeFraud = async (userId, transactionData) => {
  return aiService.fraudDetection(userId, transactionData);
};

/**
 * GET /api/ai/fraud-report  (admin)
 */
const getFraudReport = async (req, res, next) => {
  try {
    const highRisk = await FraudLog.getHighRiskUsers();
    const allLogs = await FraudLog.getAll({});

    return res.json(
      formatResponse(
        {
          high_risk_users: highRisk,
          total_events: allLogs.length,
          recent_logs: allLogs.slice(0, 50),
        },
        'Fraud report retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getMatching,
  chatbot,
  analyzeFraud,
  getFraudReport,
};
