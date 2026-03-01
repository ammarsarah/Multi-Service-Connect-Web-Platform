'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/users
router.get('/users', adminController.getUsersList);

// PUT /api/admin/users/:id/validate
router.put('/users/:id/validate', adminController.validateProvider);

// PUT /api/admin/users/:id/ban
router.put('/users/:id/ban', adminController.banUser);

// GET /api/admin/transactions
router.get('/transactions', adminController.getTransactions);

// GET /api/admin/disputes
router.get('/disputes', adminController.getDisputes);

// PUT /api/admin/disputes/:transactionId/resolve
router.put('/disputes/:transactionId/resolve', adminController.resolveDispute);

// GET /api/admin/fraud-logs
router.get('/fraud-logs', adminController.getFraudLogs);

module.exports = router;
