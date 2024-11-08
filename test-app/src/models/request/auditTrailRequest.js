const Joi = require('joi');

// Define the validation schema for audit trail filters
const auditTrailFiltersSchema = Joi.object({
  action: Joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Action must be a string'
  }),

  performedBy: Joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'PerformedBy must be a string'
  }),

  actionDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Action Date must be a string',
      'string.pattern.base': 'Action Date should be in format YYYY-MM-DD'
    })
});

// Define the validation schema for the audit trail request body
const auditTrailRequestSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'any.required': 'User ID is required'
  }),

  dealId: Joi.number().integer().required().messages({
    'number.base': 'Deal ID must be a number',
    'number.integer': 'Deal ID must be an integer'
  }),

  filters: auditTrailFiltersSchema.optional().messages({
    'object.base': 'Filters must be an object'
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    'number.base': 'Page number must be a number',
    'number.min': 'Page number must be at least 1',
    'number.integer': 'Page number must be an integer'
  }),

  limit: Joi.number().integer().min(0).default(10).optional().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be a non-negative integer',
    'number.integer': 'Limit must be an integer'
  })
})
  .strict()
  .unknown(false);

module.exports = auditTrailRequestSchema;
