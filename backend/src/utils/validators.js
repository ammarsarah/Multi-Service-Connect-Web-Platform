'use strict';

const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[!@#$%^&*()\-_+=[\]{};':"\\|,.<>/?]/, 'special character')
  .messages({
    'string.pattern.name': 'Password must contain at least one {#name}',
    'string.min': 'Password must be at least 8 characters',
  });

const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordSchema.required(),
  name: Joi.string().min(2).max(100).trim().required(),
  role: Joi.string().valid('client', 'prestataire').required(),
  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-().]{7,20}$/)
    .optional()
    .allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const serviceSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().required(),
  description: Joi.string().min(10).max(5000).trim().required(),
  category_id: Joi.string().uuid().required(),
  price: Joi.number().positive().precision(2).required(),
  location: Joi.string().max(255).trim().required(),
  availability: Joi.object().optional().allow(null),
});

const requestSchema = Joi.object({
  service_id: Joi.string().uuid().required(),
  description: Joi.string().min(10).max(2000).trim().required(),
  scheduled_date: Joi.date().iso().greater('now').optional().allow(null),
});

const reviewSchema = Joi.object({
  provider_id: Joi.string().uuid().required(),
  request_id: Joi.string().uuid().optional().allow(null),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(5).max(1000).trim().optional().allow('', null),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: passwordSchema.required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-().]{7,20}$/)
    .optional()
    .allow('', null),
  bio: Joi.string().max(1000).trim().optional().allow('', null),
  location: Joi.string().max(255).trim().optional().allow('', null),
  skills: Joi.array().items(Joi.string().max(100)).optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().max(500).trim().optional().allow('', null),
  icon: Joi.string().max(255).trim().optional().allow('', null),
});

const paymentIntentSchema = Joi.object({
  request_id: Joi.string().uuid().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  serviceSchema,
  requestSchema,
  reviewSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  updateProfileSchema,
  categorySchema,
  paymentIntentSchema,
};
