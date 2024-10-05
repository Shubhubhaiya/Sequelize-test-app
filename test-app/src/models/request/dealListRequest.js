const joi = require('joi');

// Define the validation schema for filters
const filtersSchema = joi.object({
  name: joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Name must be a string'
  }),

  therapeuticArea: joi
    .array()
    .items(
      joi.number().integer().strict().allow(null).messages({
        'number.base': 'Therapeutic Area ID must be a number',
        'number.integer': 'Therapeutic Area ID must be an integer'
      })
    )
    .allow(null)
    .optional()
    .messages({
      'array.base': 'Therapeutic Area must be an array of numbers'
    }),

  stage: joi
    .array()
    .items(
      joi.number().integer().strict().allow(null).messages({
        'number.base': 'Stage ID must be a number',
        'number.integer': 'Stage ID must be an integer'
      })
    )
    .allow(null)
    .optional()
    .messages({
      'array.base': 'Stage must be an array of numbers'
    }),

  modifiedBy: joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Modified By must be a string'
  }),

  modifiedAt: joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Modified date should be in format YYYY-MM-DD'
  }),

  dealLead: joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Deal Lead must be a string'
  })
});

// Define the validation schema for pagination, userId, and root-level properties
const dealListRequest = joi
  .object({
    userId: joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'any.required': 'User ID is required'
    }),

    filters: filtersSchema.optional().messages({
      'object.base': 'Filters must be an object'
    }),

    page: joi.number().integer().min(1).default(1).optional().messages({
      'number.base': 'Page number must be a number',
      'number.min': 'Page number must be at least 1',
      'number.integer': 'Page number must be an integer'
    }),

    limit: joi.number().integer().min(0).default(10).optional().messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be a non-negative integer',
      'number.integer': 'Limit must be an integer'
    })
  })
  .strict()
  .unknown(false);

module.exports = dealListRequest;
