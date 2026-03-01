'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications/unread-count  – before / to avoid route shadowing
router.get('/unread-count', notificationController.getUnreadCount);

// GET /api/notifications
router.get('/', notificationController.getMyNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
