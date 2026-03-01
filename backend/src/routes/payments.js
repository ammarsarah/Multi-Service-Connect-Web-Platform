'use strict';

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { paymentIntentSchema } = require('../utils/validators');

// POST /api/payments/webhook  (NO auth – raw body, Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// POST /api/payments/create-intent  (client)
router.post(
  '/create-intent',
  authenticate,
  authorize('client'),
  validate(paymentIntentSchema),
  paymentController.createPaymentIntent
);

// POST /api/payments/confirm  (client)
router.post('/confirm', authenticate, authorize('client'), paymentController.confirmPayment);

// GET /api/payments/transactions
router.get('/transactions', authenticate, paymentController.getMyTransactions);

// GET /api/payments/transactions/:id
router.get('/transactions/:id', authenticate, paymentController.getTransactionById);

// POST /api/payments/refund/:transactionId  (client)
router.post(
  '/refund/:transactionId',
  authenticate,
  authorize('client'),
  paymentController.requestRefund
);

// GET /api/payments/earnings  (prestataire)
router.get(
  '/earnings',
  authenticate,
  authorize('prestataire'),
  paymentController.getEarnings
);

module.exports = router;
