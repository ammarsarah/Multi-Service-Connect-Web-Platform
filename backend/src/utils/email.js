'use strict';

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  });

const fromAddress = `"Multi-Service Connect" <${process.env.EMAIL_FROM || 'noreply@multiserviceconnect.com'}>`;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({ from: fromAddress, to, subject, html });
    logger.info('Email sent', { messageId: info.messageId, to, subject });
    return info;
  } catch (error) {
    logger.error('Email send failure', { error: error.message, to, subject });
    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${frontendUrl}/verify-email/${token}`;
  const html = `
    <h2>Welcome to Multi-Service Connect, ${user.name}!</h2>
    <p>Please verify your email address to activate your account.</p>
    <a href="${verifyUrl}" style="
      display:inline-block;padding:12px 24px;background:#4F46E5;
      color:#fff;text-decoration:none;border-radius:6px;">
      Verify Email
    </a>
    <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>
    <hr><p style="color:#888;font-size:12px;">Multi-Service Connect</p>
  `;
  return sendEmail(user.email, 'Verify your email – Multi-Service Connect', html);
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the button below to proceed.</p>
    <a href="${resetUrl}" style="
      display:inline-block;padding:12px 24px;background:#DC2626;
      color:#fff;text-decoration:none;border-radius:6px;">
      Reset Password
    </a>
    <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    <hr><p style="color:#888;font-size:12px;">Multi-Service Connect</p>
  `;
  return sendEmail(user.email, 'Reset your password – Multi-Service Connect', html);
};

const sendNotificationEmail = async (user, subject, message) => {
  const html = `
    <h2>${subject}</h2>
    <p>Hi ${user.name},</p>
    <p>${message}</p>
    <a href="${frontendUrl}" style="
      display:inline-block;padding:12px 24px;background:#4F46E5;
      color:#fff;text-decoration:none;border-radius:6px;">
      Go to Platform
    </a>
    <hr><p style="color:#888;font-size:12px;">Multi-Service Connect</p>
  `;
  return sendEmail(user.email, subject, html);
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h2>Welcome to Multi-Service Connect! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>Your account has been verified and is ready to use.</p>
    ${user.role === 'client'
      ? '<p>Start by browsing our wide range of services and connect with trusted providers.</p>'
      : '<p>You can now create your services and start receiving requests from clients.</p>'}
    <a href="${frontendUrl}" style="
      display:inline-block;padding:12px 24px;background:#4F46E5;
      color:#fff;text-decoration:none;border-radius:6px;">
      Get Started
    </a>
    <hr><p style="color:#888;font-size:12px;">Multi-Service Connect</p>
  `;
  return sendEmail(user.email, 'Welcome to Multi-Service Connect!', html);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
};
