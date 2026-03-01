'use strict';

const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const SALT_ROUNDS = 12;

const User = {
  /**
   * Find a user by primary key.
   */
  async findById(id) {
    const result = await query(
      `SELECT id, email, name, role, phone, avatar, bio, location, skills,
              is_verified, is_active, is_banned, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find a user by email (includes password_hash for auth).
   */
  async findByEmail(email) {
    const result = await query(
      `SELECT id, email, name, role, phone, avatar, bio, location, skills,
              password_hash, is_verified, is_active, is_banned,
              email_verify_token, reset_password_token, reset_password_expires,
              refresh_token, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user. Password is hashed before storage.
   */
  async create(userData) {
    const { email, password, name, role, phone } = userData;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, name, role, phone, is_verified, is_active, created_at`,
      [email.toLowerCase(), passwordHash, name, role, phone || null]
    );
    return result.rows[0];
  },

  /**
   * Update basic user fields.
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'phone', 'avatar', 'bio', 'location', 'skills'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(data[key]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, name, role, phone, avatar, bio, location, skills,
                 is_verified, is_active, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Hash and update user password.
   */
  async updatePassword(id, password) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query(
      `UPDATE users
       SET password_hash = $1, reset_password_token = NULL,
           reset_password_expires = NULL, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [passwordHash, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Compare plain password with stored hash.
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  /**
   * Mark email as verified and clear token.
   */
  async setEmailVerified(id) {
    const result = await query(
      `UPDATE users
       SET is_verified = true, email_verify_token = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, is_verified`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Store a hashed refresh token for the user.
   */
  async updateRefreshToken(id, token) {
    const hashed = token ? await bcrypt.hash(token, SALT_ROUNDS) : null;
    await query(
      `UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2`,
      [hashed, id]
    );
  },

  /**
   * Find a user whose stored refresh token matches the plain token provided.
   */
  async findByRefreshToken(token) {
    // Candidate lookup: all active users with a stored token
    const result = await query(
      `SELECT id, email, name, role, refresh_token, is_active, is_banned
       FROM users
       WHERE refresh_token IS NOT NULL AND is_active = true AND is_banned = false`
    );
    for (const user of result.rows) {
      const match = await bcrypt.compare(token, user.refresh_token);
      if (match) return user;
    }
    return null;
  },

  /**
   * List all users with optional filters and pagination.
   */
  async getAll(filters = {}, pagination = {}) {
    const conditions = ['1=1'];
    const values = [];
    let idx = 1;

    if (filters.role) {
      conditions.push(`role = $${idx++}`);
      values.push(filters.role);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${idx++}`);
      values.push(filters.is_active);
    }
    if (filters.is_verified !== undefined) {
      conditions.push(`is_verified = $${idx++}`);
      values.push(filters.is_verified);
    }
    if (filters.search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      values.push(`%${filters.search}%`);
      idx++;
    }

    const { limit = 20, offset = 0 } = pagination;
    values.push(limit, offset);

    const countResult = await query(
      `SELECT COUNT(*) FROM users WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const rows = await query(
      `SELECT id, email, name, role, phone, avatar, bio, location, skills,
              is_verified, is_active, is_banned, created_at, updated_at
       FROM users
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return { data: rows.rows, total };
  },

  /**
   * Soft-delete a user.
   */
  async delete(id) {
    const result = await query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Store email-verification token.
   */
  async setEmailVerifyToken(id, token) {
    await query(
      `UPDATE users SET email_verify_token = $1, updated_at = NOW() WHERE id = $2`,
      [token, id]
    );
  },

  /**
   * Find user by email-verification token.
   */
  async findByEmailVerifyToken(token) {
    const result = await query(
      `SELECT id, email, name, is_verified FROM users WHERE email_verify_token = $1`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Store password-reset token with expiry.
   */
  async setResetPasswordToken(id, token, expires) {
    await query(
      `UPDATE users
       SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW()
       WHERE id = $3`,
      [token, expires, id]
    );
  },

  /**
   * Find user by valid (non-expired) reset token.
   */
  async findByResetToken(token) {
    const result = await query(
      `SELECT id, email, name FROM users
       WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Ban or unban a user.
   */
  async setBanned(id, isBanned) {
    const result = await query(
      `UPDATE users SET is_banned = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_banned`,
      [isBanned, id]
    );
    return result.rows[0] || null;
  },
};

module.exports = User;
