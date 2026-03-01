'use strict';

const logger = require('../config/logger');

/* eslint-disable no-unused-vars */
/**
 * Global error-handling middleware.
 * Must have four parameters so Express recognises it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log the error
  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error', {
      message: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Joi / express-validator validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.details
      ? err.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
      : [{ message: err.message }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Token not yet active';
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique violation
        statusCode = 409;
        message = 'A record with this value already exists';
        break;
      case '23503': // foreign key violation
        statusCode = 409;
        message = 'Referenced record does not exist';
        break;
      case '23502': // not null violation
        statusCode = 400;
        message = `Field '${err.column}' is required`;
        break;
      case '22P02': // invalid input syntax
        statusCode = 400;
        message = 'Invalid input format';
        break;
      default:
        if (err.code.startsWith('28')) {
          // auth failure codes
          statusCode = 503;
          message = 'Database authentication error';
        }
    }
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    statusCode = err.statusCode || 402;
    message = err.message;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
    } else {
      message = err.message;
    }
  }

  // CORS errors
  if (err.message && err.message.startsWith('CORS policy')) {
    statusCode = 403;
    message = err.message;
  }

  // Build response
  const response = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler – placed AFTER all routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };
