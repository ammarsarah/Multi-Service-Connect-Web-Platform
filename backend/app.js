'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');

const { applySecurityMiddleware } = require('./src/middlewares/security');
const { generalLimiter, speedLimiter } = require('./src/middlewares/rateLimiter');
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');
const logger = require('./src/config/logger');

// Route modules
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const serviceRoutes = require('./src/routes/services');
const requestRoutes = require('./src/routes/requests');
const paymentRoutes = require('./src/routes/payments');
const reviewRoutes = require('./src/routes/reviews');
const categoryRoutes = require('./src/routes/categories');
const notificationRoutes = require('./src/routes/notifications');
const adminRoutes = require('./src/routes/admin');
const aiRoutes = require('./src/routes/ai');

const app = express();

// ─── Security middleware (helmet, cors, xss headers) ────────────────────────
applySecurityMiddleware(app);

// ─── HTTP request logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Body parsers ────────────────────────────────────────────────────────────
// Raw body must be captured BEFORE json() middleware for Stripe webhook verification.
app.use((req, res, next) => {
  if (req.originalUrl.includes('/payments/webhook')) {
    return next(); // webhook uses express.raw() defined on its router
  }
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) return next(err);
    // Preserve raw body for webhook if needed
    next();
  });
});

app.use((req, res, next) => {
  if (req.originalUrl.includes('/payments/webhook')) return next();
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});

// Store raw body for Stripe webhook verification
app.use((req, res, next) => {
  if (req.originalUrl.includes('/payments/webhook')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      req.rawBody = Buffer.from(data);
      next();
    });
  } else {
    next();
  }
});

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Rate limiting + slow-down ───────────────────────────────────────────────
app.use('/api', speedLimiter);
app.use('/api', generalLimiter);

// ─── Health check (no auth, no rate limit) ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
