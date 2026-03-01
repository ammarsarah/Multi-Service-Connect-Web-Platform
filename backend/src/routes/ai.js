'use strict';

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, authorize } = require('../middlewares/auth');

// GET /api/ai/recommendations  (authenticated)
router.get('/recommendations', authenticate, aiController.getRecommendations);

// GET /api/ai/matching/:serviceId  (authenticated)
router.get('/matching/:serviceId', authenticate, aiController.getMatching);

// POST /api/ai/chat  (authenticated)
router.post('/chat', authenticate, aiController.chatbot);

// GET /api/ai/fraud-report  (admin)
router.get('/fraud-report', authenticate, authorize('admin'), aiController.getFraudReport);

module.exports = router;
