'use strict';

require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = parseInt(process.env.PORT, 10) || 5000;

let server;

const startServer = async () => {
  try {
    // Verify database connectivity before accepting traffic
    await testConnection();
    logger.info('Database connection verified');

    server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error', { error: err.message });
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received – shutting down gracefully`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      const { pool } = require('./src/config/database');
      pool.end(() => {
        logger.info('Database pool closed');
        process.exit(0);
      });
    });

    // Force shutdown after 10 s if graceful close hangs
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  shutdown('uncaughtException');
});

startServer();
