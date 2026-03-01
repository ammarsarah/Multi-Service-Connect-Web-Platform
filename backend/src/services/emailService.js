'use strict';

// Re-export all email utilities from utils/email.js
// Additional template rendering or provider switching can be added here.

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
} = require('../utils/email');

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
};
