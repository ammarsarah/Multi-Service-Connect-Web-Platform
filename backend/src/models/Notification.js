'use strict';

const { query } = require('../config/database');

const Notification = {
  /**
   * Create a notification for a user.
   */
  async create(userId, type, message, data = null) {
    const result = await query(
      `INSERT INTO notifications (user_id, type, message, data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, type, message, data ? JSON.stringify(data) : null]
    );
    return result.rows[0];
  },

  /**
   * Get paginated notifications for a user.
   */
  async findByUserId(userId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;
    const result = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1`,
      [userId]
    );
    return { data: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id) {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark all of a user's notifications as read.
   */
  async markAllAsRead(userId) {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  },

  /**
   * Count unread notifications for a user.
   */
  async getUnreadCount(userId) {
    const result = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = Notification;
