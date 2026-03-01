'use strict';

const { query } = require('../config/database');

const Transaction = {
  /**
   * Create a new transaction record.
   */
  async create(data) {
    const {
      request_id,
      client_id,
      provider_id,
      amount,
      commission,
      provider_amount,
      currency = 'usd',
      stripe_payment_intent_id,
      status = 'pending',
    } = data;

    const result = await query(
      `INSERT INTO transactions
         (request_id, client_id, provider_id, amount, commission,
          provider_amount, currency, stripe_payment_intent_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        request_id, client_id, provider_id, amount, commission,
        provider_amount, currency, stripe_payment_intent_id, status,
      ]
    );
    return result.rows[0];
  },

  /**
   * Find a transaction by primary key.
   */
  async findById(id) {
    const result = await query(
      `SELECT t.*,
              c.name AS client_name, c.email AS client_email,
              p.name AS provider_name, p.email AS provider_email,
              sr.description AS request_description,
              s.title AS service_title
       FROM transactions t
       JOIN users c ON c.id = t.client_id
       JOIN users p ON p.id = t.provider_id
       LEFT JOIN service_requests sr ON sr.id = t.request_id
       LEFT JOIN services s ON s.id = sr.service_id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find transactions for a user (as client or provider).
   */
  async findByUserId(userId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;
    const result = await query(
      `SELECT t.*,
              c.name AS client_name,
              p.name AS provider_name,
              s.title AS service_title
       FROM transactions t
       JOIN users c ON c.id = t.client_id
       JOIN users p ON p.id = t.provider_id
       LEFT JOIN service_requests sr ON sr.id = t.request_id
       LEFT JOIN services s ON s.id = sr.service_id
       WHERE t.client_id = $1 OR t.provider_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM transactions WHERE client_id = $1 OR provider_id = $1`,
      [userId]
    );
    return { data: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  },

  /**
   * Update a transaction status and optional Stripe metadata.
   */
  async updateStatus(id, status, stripeData = {}) {
    const result = await query(
      `UPDATE transactions
       SET status = $1,
           stripe_charge_id = COALESCE($2, stripe_charge_id),
           stripe_refund_id = COALESCE($3, stripe_refund_id),
           paid_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE paid_at END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, stripeData.chargeId || null, stripeData.refundId || null, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Admin: list all transactions with filters and pagination.
   */
  async getAll(filters = {}, pagination = {}) {
    const conditions = ['1=1'];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.client_id) {
      conditions.push(`t.client_id = $${idx++}`);
      values.push(filters.client_id);
    }
    if (filters.provider_id) {
      conditions.push(`t.provider_id = $${idx++}`);
      values.push(filters.provider_id);
    }
    if (filters.start_date) {
      conditions.push(`t.created_at >= $${idx++}`);
      values.push(filters.start_date);
    }
    if (filters.end_date) {
      conditions.push(`t.created_at <= $${idx++}`);
      values.push(filters.end_date);
    }

    const { limit = 20, offset = 0 } = pagination;

    const countResult = await query(
      `SELECT COUNT(*) FROM transactions t WHERE ${conditions.join(' AND ')}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);

    const rows = await query(
      `SELECT t.*,
              c.name AS client_name, p.name AS provider_name,
              s.title AS service_title
       FROM transactions t
       JOIN users c ON c.id = t.client_id
       JOIN users p ON p.id = t.provider_id
       LEFT JOIN service_requests sr ON sr.id = t.request_id
       LEFT JOIN services s ON s.id = sr.service_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return { data: rows.rows, total };
  },

  /**
   * Platform-level statistics.
   */
  async getStats() {
    const result = await query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(amount), 0) AS total_volume,
         COALESCE(SUM(commission), 0) AS total_commission,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS completed_volume,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
         COUNT(CASE WHEN status = 'refunded' THEN 1 END) AS refunded_count,
         COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed_count
       FROM transactions`
    );
    return result.rows[0];
  },

  /**
   * Find a transaction by Stripe payment intent ID.
   */
  async findByStripeIntentId(intentId) {
    const result = await query(
      `SELECT * FROM transactions WHERE stripe_payment_intent_id = $1`,
      [intentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Provider earnings summary.
   */
  async getProviderEarnings(providerId) {
    const result = await query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(provider_amount), 0) AS total_earnings,
         COALESCE(SUM(CASE WHEN status = 'completed' THEN provider_amount ELSE 0 END), 0) AS available_earnings,
         COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
                           THEN provider_amount ELSE 0 END), 0) AS this_month_earnings
       FROM transactions
       WHERE provider_id = $1 AND status IN ('completed', 'pending')`,
      [providerId]
    );
    return result.rows[0];
  },
};

module.exports = Transaction;
