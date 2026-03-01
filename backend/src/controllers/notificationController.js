'use strict';

const { Notification } = require('../models');
const { formatResponse, paginate } = require('../utils/helpers');

/**
 * GET /api/notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = paginate(page, limit);
    const { data, total } = await Notification.findByUserId(req.user.id, pagination);

    return res.json(
      formatResponse(data, 'Notifications retrieved', {
        page: parseInt(page, 10) || 1,
        limit: pagination.limit,
        total,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.markAsRead(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.json(formatResponse(notification, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    return res.json(formatResponse(null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    return res.json(formatResponse({ count }, 'Unread count retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount };
