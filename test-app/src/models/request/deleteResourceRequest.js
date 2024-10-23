const joi = require('joi');

// Request params for deleting a resource
const deleteResourceRequest = joi.object({
  resourceId: joi.number().required().messages({
    'any.required': 'Resource ID is required',
    'number.base': 'Resource ID must be a number',
    'number.integer': 'Resource ID must be an integer'
  }),
  stageId: joi.number().required().messages({
    'any.required': 'Stage ID is required',
    'number.base': 'Stage ID must be a number',
    'number.integer': 'Stage ID must be an integer'
  }),
  dealId: joi.number().required().messages({
    'any.required': 'Deal ID is required',
    'number.base': 'Deal ID must be a number',
    'number.integer': 'Deal ID must be an integer'
  })
});

// Query for userId validation
const deleteResourceQuery = joi
  .object({
    userId: joi.number().required().messages({
      'any.required': 'User ID is required',
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer'
    })
  })
  .unknown(false);

module.exports = {
  deleteResourceRequest,
  deleteResourceQuery
};
