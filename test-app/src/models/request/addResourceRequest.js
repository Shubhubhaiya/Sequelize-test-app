const joi = require('joi');

const addResourceRequest = joi.object({
  dealId: joi.number().integer().strict().required().messages({
    'any.required': 'Deal ID is required',
    'number.base': 'Deal ID must be a number',
    'number.integer': 'Deal ID must be an integer'
  }),
  lineFunction: joi.number().integer().strict().required().messages({
    'any.required': 'Line Function is required',
    'number.base': 'Line Function must be a number',
    'number.integer': 'Line Function must be an integer'
  }),
  stages: joi
    .array()
    .items(joi.number().integer().strict().required())
    .min(1)
    .required()
    .messages({
      'any.required': 'Stages are required',
      'array.base': 'Stages must be an array of numbers',
      'array.min': 'At least one stage must be specified',
      'number.base': 'Each stage must be a number',
      'number.integer': 'Each stage must be an integer'
    }),
  vdrAccessRequested: joi.boolean().required().messages({
    'any.required': 'VDR Access Requested is required',
    'boolean.base': 'VDR Access Requested must be a boolean value'
  }),
  webTrainingStatus: joi
    .string()
    .valid('Not Started', 'In-progress', 'completed')
    .required()
    .messages({
      'any.required': 'Web Training Status is required',
      'string.base': 'Web Training Status must be a string',
      'any.only':
        'Web Training Status must be one of "Not Started", "In-progress", "completed"'
    }),
  oneToOneDiscussion: joi.string().allow(null, '').optional().messages({
    'string.base': 'One-to-One Discussion must be a string'
  }),
  optionalColumn: joi.string().allow(null, '').optional().messages({
    'string.base': 'Optional Column must be a string'
  }),
  isCoreTeamMember: joi.boolean().required().messages({
    'any.required': 'Core Team Member field is required',
    'boolean.base': 'Core Team Member must be a boolean value'
  }),
  email: joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'string.base': 'Email must be a string'
  }),
  firstName: joi.string().trim().required().messages({
    'any.required': 'First Name is required',
    'string.base': 'First Name must be a string'
  }),
  lastName: joi.string().trim().required().messages({
    'any.required': 'Last Name is required',
    'string.base': 'Last Name must be a string'
  }),
  title: joi.string().trim().required().messages({
    'any.required': 'Title is required',
    'string.base': 'Title must be a string'
  }),
  phone: joi
    .string()
    .allow(null, '')
    .pattern(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/
    )
    .optional()
    .messages({
      'string.base': 'Phone must be a string',
      'string.pattern.base': 'Phone number is invalid'
    }),
  countryCode: joi
    .string()
    .allow(null, '')
    .pattern(/^[A-Z]{2}$/)
    .optional()
    .messages({
      'string.base': 'Country Code must be a string',
      'string.pattern.base': 'Country Code must be a valid ISO 2-letter code'
    }),
  siteCode: joi.string().trim().required().messages({
    'any.required': 'Site Code is required',
    'string.base': 'Site Code must be a string'
  }),
  novartis521ID: joi.string().trim().required().messages({
    'any.required': 'Novartis 521 ID is required',
    'string.base': 'Novartis 521 ID must be a string'
  })
});

module.exports = {
  addResourceRequest
};
