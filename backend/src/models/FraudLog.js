'use strict';

const { query } = require('../config/database');

const FraudLog = {
  /**
   * Record a fraud-detection event.
   */
  async create(data) {
    const { user_id, type, details, risk_score } = data;
    const result = await query(
      `INSERT INTO fraud_logs (user_id, type, details, risk_score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, type, details ? JSON.stringify(details) : null, risk_score || 0]
    );
    return result.rows[0];
  },

  /**
   * Get all fraud logs for a user.
   */
  async findByUserId(userId) {
    const result = await query(
      `SELECT fl.*, u.name AS user_name, u.email AS user_email
       FROM fraud_logs fl
       JOIN users u ON u.id = fl.user_id
       WHERE fl.user_id = $1
       ORDER BY fl.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * List all fraud logs with optional filters.
   */
  async getAll(filters = {}) {
    const conditions = ['1=1'];
    const values = [];
    let idx = 1;

    if (filters.user_id) {
      conditions.push(`fl.user_id = $${idx++}`);
      values.push(filters.user_id);
    }
    if (filters.type) {
      conditions.push(`fl.type = $${idx++}`);
      values.push(filters.type);
    }
    if (filters.min_risk_score !== undefined) {
      conditions.push(`fl.risk_score >= $${idx++}`);
      values.push(filters.min_risk_score);
    }

    const result = await query(
      `SELECT fl.*, u.name AS user_name, u.email AS user_email
       FROM fraud_logs fl
       JOIN users u ON u.id = fl.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY fl.created_at DESC`,
      values
    );
    return result.rows;
  },

  /**
   * Return users whose cumulative risk score exceeds a threshold.
   */
  async getHighRiskUsers(threshold = 70) {
    const result = await query(
      `SELECT fl.user_id, u.name, u.email,
              MAX(fl.risk_score) AS max_risk_score,
              COUNT(*) AS fraud_event_count
       FROM fraud_logs fl
       JOIN users u ON u.id = fl.user_id
       WHERE fl.risk_score >= $1
       GROUP BY fl.user_id, u.name, u.email
       ORDER BY max_risk_score DESC`,
      [threshold]
    );
    return result.rows;
  },
};

module.exports = FraudLog;
