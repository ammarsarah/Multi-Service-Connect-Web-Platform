'use strict';

const Stripe = require('stripe');
const logger = require('../config/logger');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.10');

/**
 * Create a Stripe PaymentIntent.
 * @param {number} amount - Amount in smallest currency unit (cents for USD)
 * @param {string} currency - ISO currency code (default 'usd')
 * @param {object} metadata - Metadata to attach to the intent
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    logger.info('Stripe PaymentIntent created', { id: intent.id, amount, currency });
    return intent;
  } catch (error) {
    logger.error('Stripe createPaymentIntent error', { error: error.message });
    throw error;
  }
};

/**
 * Calculate the platform commission on a given amount.
 * @param {number} amount - Amount in currency units (not cents)
 * @returns {number} Commission amount
 */
const calculateCommission = (amount) => Math.round(amount * COMMISSION_RATE * 100) / 100;

/**
 * Create a refund for a PaymentIntent.
 * @param {string} paymentIntentId - Stripe PaymentIntent ID
 * @param {number|null} amount - Amount in cents to refund; null = full refund
 */
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const params = { payment_intent: paymentIntentId };
    if (amount) params.amount = amount;
    const refund = await stripe.refunds.create(params);
    logger.info('Stripe refund created', { id: refund.id, paymentIntentId });
    return refund;
  } catch (error) {
    logger.error('Stripe createRefund error', { error: error.message });
    throw error;
  }
};

/**
 * Retrieve a PaymentIntent by ID.
 */
const retrievePaymentIntent = async (id) => {
  try {
    return await stripe.paymentIntents.retrieve(id);
  } catch (error) {
    logger.error('Stripe retrievePaymentIntent error', { error: error.message });
    throw error;
  }
};

/**
 * Construct and verify a Stripe webhook event.
 * @param {Buffer} payload - Raw request body
 * @param {string} sig - Stripe-Signature header value
 */
const constructWebhookEvent = (payload, sig) => {
  return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
};

module.exports = {
  createPaymentIntent,
  calculateCommission,
  createRefund,
  retrievePaymentIntent,
  constructWebhookEvent,
  stripe,
};
