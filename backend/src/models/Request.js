'use strict';

const { query } = require('../config/database');

const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];

const Request = {
  /**
   * Create a new service request.
   */
  async create(data) {
    const { client_id, service_id, description, scheduled_date } = data;
    const result = await query(
      `INSERT INTO service_requests (client_id, service_id, description, scheduled_date, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [client_id, service_id, description, scheduled_date || null]
    );
    return result.rows[0];
  },

  /**
   * Find a request by primary key (with service & user info).
   */
  async findById(id) {
    const result = await query(
      `SELECT sr.*,
              s.title AS service_title, s.price AS service_price,
              s.provider_id,
              c.name AS client_name, c.email AS client_email, c.avatar AS client_avatar,
              p.name AS provider_name, p.email AS provider_email, p.avatar AS provider_avatar
       FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       JOIN users c ON c.id = sr.client_id
       JOIN users p ON p.id = s.provider_id
       WHERE sr.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get requests submitted by a client.
   */
  async findByClientId(clientId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;
    const result = await query(
      `SELECT sr.*,
              s.title AS service_title, s.price AS service_price,
              p.name AS provider_name, p.avatar AS provider_avatar
       FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       JOIN users p ON p.id = s.provider_id
       WHERE sr.client_id = $1
       ORDER BY sr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [clientId, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM service_requests WHERE client_id = $1`,
      [clientId]
    );
    return { data: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  },

  /**
   * Get requests directed to a provider's services.
   */
  async findByProviderId(providerId, pagination = {}) {
    const { limit = 20, offset = 0 } = pagination;
    const result = await query(
      `SELECT sr.*,
              s.title AS service_title, s.price AS service_price,
              c.name AS client_name, c.email AS client_email, c.avatar AS client_avatar
       FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       JOIN users c ON c.id = sr.client_id
       WHERE s.provider_id = $1
       ORDER BY sr.created_at DESC
       LIMIT $2 OFFSET $3`,
      [providerId, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       WHERE s.provider_id = $1`,
      [providerId]
    );
    return { data: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  },

  /**
   * Update the status of a request.
   */
  async updateStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    const result = await query(
      `UPDATE service_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Admin: list all requests with filters and pagination.
   */
  async getAll(filters = {}, pagination = {}) {
    const conditions = ['1=1'];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`sr.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.client_id) {
      conditions.push(`sr.client_id = $${idx++}`);
      values.push(filters.client_id);
    }
    if (filters.provider_id) {
      conditions.push(`s.provider_id = $${idx++}`);
      values.push(filters.provider_id);
    }

    const { limit = 20, offset = 0 } = pagination;

    const countResult = await query(
      `SELECT COUNT(*) FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       WHERE ${conditions.join(' AND ')}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);

    const rows = await query(
      `SELECT sr.*,
              s.title AS service_title, s.price AS service_price,
              c.name AS client_name, p.name AS provider_name
       FROM service_requests sr
       JOIN services s ON s.id = sr.service_id
       JOIN users c ON c.id = sr.client_id
       JOIN users p ON p.id = s.provider_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY sr.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return { data: rows.rows, total };
  },
};

module.exports = Request;
