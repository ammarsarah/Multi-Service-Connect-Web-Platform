'use strict';

/**
 * Middleware factory: validates req.body against a Joi schema.
 * Returns 422 with error details on failure.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: details,
    });
  }

  req.body = value;
  next();
};

module.exports = { validate };
