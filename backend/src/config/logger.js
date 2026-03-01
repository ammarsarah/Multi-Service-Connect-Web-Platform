'use strict';

const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const isDev = process.env.NODE_ENV !== 'production';

const transports = [
  new winston.transports.Console({
    format: isDev ? devFormat : prodFormat,
    silent: process.env.NODE_ENV === 'test',
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: prodFormat,
    maxsize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    format: prodFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 10,
  }),
];

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports,
  exitOnError: false,
});

module.exports = logger;
