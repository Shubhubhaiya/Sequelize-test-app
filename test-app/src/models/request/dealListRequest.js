const Joi = require('joi');

// Define the validation schema for filters
const dealListRequest = Joi.object({
  name: Joi.string().trim().optional().messages({
    'string.base': 'Name must be a string'
  }),

  therapeuticArea: Joi.array()
    .items(
      Joi.number().integer().strict().messages({
        'number.base': 'Therapeutic Area ID must be a number',
        'number.integer': 'Therapeutic Area ID must be an integer'
      })
    )
    .optional()
    .messages({
      'array.base': 'Therapeutic Area must be an array of numbers'
    }),

  stage: Joi.array()
    .items(
      Joi.number().integer().strict().messages({
        'number.base': 'Stage ID must be a number',
        'number.integer': 'Stage ID must be an integer'
      })
    )
    .optional()
    .messages({
      'array.base': 'Stage must be an array of numbers'
    }),

  modifiedBy: Joi.string().trim().optional().messages({
    'string.base': 'Modified By must be a string'
  }),

  modifiedAt: Joi.date().optional().messages({
    'date.base': 'Modified At must be a valid date'
  }),

  dealLead: Joi.string().trim().optional().messages({
    'string.base': 'Deal Lead must be a string'
  })
});

module.exports = dealListRequest;
