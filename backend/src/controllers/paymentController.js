'use strict';

const { Transaction, Request, Service, Notification } = require('../models');
const paymentService = require('../services/paymentService');
const { formatResponse, paginate } = require('../utils/helpers');
const logger = require('../config/logger');

/**
 * POST /api/payments/create-intent  (client)
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { request_id } = req.body;

    const serviceRequest = await Request.findById(request_id);
    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (serviceRequest.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (serviceRequest.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Request must be accepted first' });
    }

    const amountInCents = Math.round(serviceRequest.service_price * 100);
    const commission = paymentService.calculateCommission(serviceRequest.service_price);
    const providerAmount = serviceRequest.service_price - commission;

    const intent = await paymentService.createPaymentIntent(amountInCents, 'usd', {
      request_id,
      client_id: req.user.id,
      provider_id: serviceRequest.provider_id,
    });

    // Create pending transaction record
    const transaction = await Transaction.create({
      request_id,
      client_id: req.user.id,
      provider_id: serviceRequest.provider_id,
      amount: serviceRequest.service_price,
      commission,
      provider_amount: providerAmount,
      currency: 'usd',
      stripe_payment_intent_id: intent.id,
      status: 'pending',
    });

    return res.status(201).json(
      formatResponse(
        { clientSecret: intent.client_secret, transactionId: transaction.id },
        'Payment intent created'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/confirm  (client)
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { payment_intent_id } = req.body;
    const intent = await paymentService.retrievePaymentIntent(payment_intent_id);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: `Payment status: ${intent.status}` });
    }

    const transaction = await Transaction.findByStripeIntentId(payment_intent_id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const updated = await Transaction.updateStatus(transaction.id, 'completed', {
      chargeId: intent.latest_charge,
    });

    await Notification.create(
      transaction.provider_id,
      'payment_received',
      `Payment of $${transaction.amount} received`,
      { transaction_id: transaction.id }
    );

    return res.json(formatResponse(updated, 'Payment confirmed'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/webhook  (Stripe webhook – no auth)
 */
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = paymentService.constructWebhookEvent(req.rawBody, sig);
    } catch (err) {
      logger.warn('Webhook signature verification failed', { error: err.message });
      return res.status(400).json({ success: false, message: 'Webhook signature invalid' });
    }

    const intentId = event.data.object.id || event.data.object.payment_intent;

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const transaction = await Transaction.findByStripeIntentId(event.data.object.id);
        if (transaction && transaction.status !== 'completed') {
          await Transaction.updateStatus(transaction.id, 'completed', {
            chargeId: event.data.object.latest_charge,
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const transaction = await Transaction.findByStripeIntentId(event.data.object.id);
        if (transaction) {
          await Transaction.updateStatus(transaction.id, 'failed');
        }
        break;
      }
      case 'charge.refunded': {
        const transaction = await Transaction.findByStripeIntentId(event.data.object.payment_intent);
        if (transaction) {
          await Transaction.updateStatus(transaction.id, 'refunded', {
            refundId: event.data.object.refunds?.data?.[0]?.id,
          });
        }
        break;
      }
      default:
        logger.debug('Unhandled webhook event type', { type: event.type });
    }

    return res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/transactions
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = paginate(page, limit);
    const { data, total } = await Transaction.findByUserId(req.user.id, pagination);

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
 * GET /api/payments/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    const isParty =
      transaction.client_id === req.user.id || transaction.provider_id === req.user.id;
    if (!isParty && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json(formatResponse(transaction, 'Transaction retrieved'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/refund/:transactionId  (client)
 */
const requestRefund = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (transaction.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed transactions can be refunded' });
    }

    const refund = await paymentService.createRefund(transaction.stripe_payment_intent_id);
    await Transaction.updateStatus(transaction.id, 'refunded', { refundId: refund.id });

    await Notification.create(
      transaction.provider_id,
      'refund_issued',
      `A refund of $${transaction.amount} has been issued`,
      { transaction_id: transaction.id }
    );

    return res.json(formatResponse({ refundId: refund.id }, 'Refund processed'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/earnings  (prestataire)
 */
const getEarnings = async (req, res, next) => {
  try {
    const earnings = await Transaction.getProviderEarnings(req.user.id);
    return res.json(formatResponse(earnings, 'Earnings retrieved'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getMyTransactions,
  getTransactionById,
  requestRefund,
  getEarnings,
};
