'use strict';

const { query } = require('../config/database');

const Category = {
  /**
   * Return all active categories.
   */
  async findAll() {
    const result = await query(
      `SELECT * FROM categories WHERE is_active = true ORDER BY name ASC`
    );
    return result.rows;
  },

  /**
   * Find a category by primary key.
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM categories WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new category.
   */
  async create(data) {
    const { name, description, icon } = data;
    const result = await query(
      `INSERT INTO categories (name, description, icon)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, icon || null]
    );
    return result.rows[0];
  },

  /**
   * Update a category.
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = ['name', 'description', 'icon', 'is_active'];
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
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Soft-delete a category.
   */
  async delete(id) {
    const result = await query(
      `UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = Category;
