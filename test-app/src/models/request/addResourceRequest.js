const joi = require('joi');

const resourceSchema = joi.object({
  email: joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'string.base': 'Email must be a string'
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
  })
});

const addResourceRequest = joi.object({
  userId: joi.number().integer().strict().required().messages({
    'any.required': 'User ID is required',
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer'
  }),
  dealId: joi.number().integer().strict().required().messages({
    'any.required': 'Deal ID is required',
    'number.base': 'Deal ID must be a number',
    'number.integer': 'Deal ID must be an integer'
  }),
  resources: joi.array().items(resourceSchema).min(1).required().messages({
    'any.required': 'Resources are required',
    'array.base': 'Resources must be an array of resource objects',
    'array.min': 'At least one resource must be specified'
  })
});

module.exports = {
  addResourceRequest
};
