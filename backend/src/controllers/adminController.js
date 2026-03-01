'use strict';

const { User, Transaction, Request, FraudLog } = require('../models');
const { formatResponse, paginate } = require('../utils/helpers');
const { query } = require('../config/database');

/**
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [userStats, txStats, requestStats] = await Promise.all([
      query(`
        SELECT
          COUNT(*) AS total_users,
          COUNT(CASE WHEN role = 'client' THEN 1 END) AS clients,
          COUNT(CASE WHEN role = 'prestataire' THEN 1 END) AS providers,
          COUNT(CASE WHEN is_verified = true THEN 1 END) AS verified_users,
          COUNT(CASE WHEN is_banned = true THEN 1 END) AS banned_users,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS new_this_month
        FROM users
      `),
      Transaction.getStats(),
      query(`
        SELECT
          COUNT(*) AS total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
        FROM service_requests
      `),
    ]);

    return res.json(
      formatResponse(
        {
          users: userStats.rows[0],
          transactions: txStats,
          requests: requestStats.rows[0],
        },
        'Dashboard stats retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/validate  (approve/reject provider)
 */
const validateProvider = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'prestataire') {
      return res.status(400).json({ success: false, message: 'User is not a provider' });
    }

    const isVerified = action === 'approve';
    const updated = await User.update(req.params.id, { is_active: isVerified });

    return res.json(
      formatResponse(updated, `Provider ${action === 'approve' ? 'approved' : 'rejected'}`)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, status, start_date, end_date } = req.query;
    const pagination = paginate(page, limit);
    const filters = {};
    if (status) filters.status = status;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;

    const { data, total } = await Transaction.getAll(filters, pagination);
    return res.json(
      formatResponse(data, 'Transactions retrieved', {
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
 * GET /api/admin/disputes  (transactions with disputed/refunded status)
 */
const getDisputes = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = paginate(page, limit);
    const { data, total } = await Transaction.getAll({ status: 'disputed' }, pagination);
    return res.json(
      formatResponse(data, 'Disputes retrieved', {
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
 * PUT /api/admin/disputes/:transactionId/resolve
 */
const resolveDispute = async (req, res, next) => {
  try {
    const { resolution } = req.body; // 'refund' | 'release'
    if (!['refund', 'release'].includes(resolution)) {
      return res.status(400).json({ success: false, message: 'Resolution must be refund or release' });
    }
    const newStatus = resolution === 'refund' ? 'refunded' : 'completed';
    const updated = await Transaction.updateStatus(req.params.transactionId, newStatus);
    if (!updated) return res.status(404).json({ success: false, message: 'Transaction not found' });
    return res.json(formatResponse(updated, `Dispute resolved: ${newStatus}`));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 */
const getUsersList = async (req, res, next) => {
  try {
    const { page, limit, role, is_active, search } = req.query;
    const pagination = paginate(page, limit);
    const filters = {};
    if (role) filters.role = role;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (search) filters.search = search;

    const { data, total } = await User.getAll(filters, pagination);
    return res.json(
      formatResponse(data, 'Users retrieved', {
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
 * PUT /api/admin/users/:id/ban
 */
const banUser = async (req, res, next) => {
  try {
    const { ban } = req.body; // true | false
    const updated = await User.setBanned(req.params.id, !!ban);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json(formatResponse(updated, ban ? 'User banned' : 'User unbanned'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/fraud-logs
 */
const getFraudLogs = async (req, res, next) => {
  try {
    const { user_id, type, min_risk_score } = req.query;
    const filters = {};
    if (user_id) filters.user_id = user_id;
    if (type) filters.type = type;
    if (min_risk_score) filters.min_risk_score = parseFloat(min_risk_score);

    const logs = await FraudLog.getAll(filters);
    return res.json(formatResponse(logs, 'Fraud logs retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  validateProvider,
  getTransactions,
  getDisputes,
  resolveDispute,
  getUsersList,
  banUser,
  getFraudLogs,
};
