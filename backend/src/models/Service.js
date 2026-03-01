'use strict';

const { query } = require('../config/database');

const Service = {
  /**
   * Find a service by primary key.
   */
  async findById(id) {
    const result = await query(
      `SELECT s.*, c.name AS category_name
       FROM services s
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.id = $1 AND s.is_active = true`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find all services belonging to a provider.
   */
  async findByProviderId(providerId) {
    const result = await query(
      `SELECT s.*, c.name AS category_name
       FROM services s
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.provider_id = $1
       ORDER BY s.created_at DESC`,
      [providerId]
    );
    return result.rows;
  },

  /**
   * Create a new service.
   */
  async create(data) {
    const { provider_id, title, description, category_id, price, location, availability } = data;
    const result = await query(
      `INSERT INTO services
         (provider_id, title, description, category_id, price, location, availability)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [provider_id, title, description, category_id, price, location, availability || null]
    );
    return result.rows[0];
  },

  /**
   * Update a service's fields.
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = ['title', 'description', 'category_id', 'price', 'location', 'availability', 'is_active'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return null;

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Soft-delete a service.
   */
  async delete(id) {
    const result = await query(
      `UPDATE services SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * List services with optional filters and pagination.
   */
  async getAll(filters = {}, pagination = {}) {
    const conditions = ['s.is_active = true'];
    const values = [];
    let idx = 1;

    if (filters.category_id) {
      conditions.push(`s.category_id = $${idx++}`);
      values.push(filters.category_id);
    }
    if (filters.location) {
      conditions.push(`s.location ILIKE $${idx++}`);
      values.push(`%${filters.location}%`);
    }
    if (filters.min_price !== undefined) {
      conditions.push(`s.price >= $${idx++}`);
      values.push(filters.min_price);
    }
    if (filters.max_price !== undefined) {
      conditions.push(`s.price <= $${idx++}`);
      values.push(filters.max_price);
    }
    if (filters.search) {
      conditions.push(`(s.title ILIKE $${idx} OR s.description ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }
    if (filters.min_rating !== undefined) {
      conditions.push(`(
        SELECT COALESCE(AVG(r.rating), 0)
        FROM reviews r WHERE r.provider_id = s.provider_id
      ) >= $${idx++}`);
      values.push(filters.min_rating);
    }

    const { limit = 20, offset = 0 } = pagination;

    const countResult = await query(
      `SELECT COUNT(*) FROM services s WHERE ${conditions.join(' AND ')}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);

    const rows = await query(
      `SELECT s.*, c.name AS category_name,
              u.name AS provider_name, u.avatar AS provider_avatar,
              COALESCE(AVG(rv.rating), 0) AS avg_rating,
              COUNT(DISTINCT rv.id) AS review_count
       FROM services s
       LEFT JOIN categories c ON c.id = s.category_id
       LEFT JOIN users u ON u.id = s.provider_id
       LEFT JOIN reviews rv ON rv.provider_id = s.provider_id
       WHERE ${conditions.join(' AND ')}
       GROUP BY s.id, c.name, u.name, u.avatar
       ORDER BY s.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return { data: rows.rows, total };
  },

  /**
   * Get a service with full provider information.
   */
  async getWithProviderInfo(id) {
    const result = await query(
      `SELECT s.*,
              c.name AS category_name,
              u.id AS provider_id, u.name AS provider_name,
              u.email AS provider_email, u.avatar AS provider_avatar,
              u.bio AS provider_bio, u.location AS provider_location,
              u.skills AS provider_skills,
              COALESCE(AVG(rv.rating), 0) AS avg_rating,
              COUNT(DISTINCT rv.id) AS review_count
       FROM services s
       LEFT JOIN categories c ON c.id = s.category_id
       LEFT JOIN users u ON u.id = s.provider_id
       LEFT JOIN reviews rv ON rv.provider_id = s.provider_id
       WHERE s.id = $1 AND s.is_active = true
       GROUP BY s.id, c.name, u.id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Service;
