const Joi = require('joi');

const resourceDetailRequest = {
  query: Joi.object({
    resourceId: Joi.number().integer().required().messages({
      'any.required': 'Resource ID is required',
      'number.base': 'Resource ID must be a number',
      'number.integer': 'Resource ID must be an integer'
    }),
    dealId: Joi.number().integer().required().messages({
      'any.required': 'Deal ID is required',
      'number.base': 'Deal ID must be a number',
      'number.integer': 'Deal ID must be an integer'
    }),
    stageId: Joi.number().integer().required().messages({
      'any.required': 'Stage ID is required',
      'number.base': 'Stage ID must be a number',
      'number.integer': 'Stage ID must be an integer'
    })
  })
};

module.exports = resourceDetailRequest;
