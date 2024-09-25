const joi = require('joi');

const createDealRequest = joi.object({
  name: joi.string().trim().required().messages({
    'any.required': 'Deal name is required',
    'string.base': 'Deal name must be a string'
  }),

  stage: joi.number().integer().strict().required().messages({
    'any.required': 'Stage ID is required',
    'number.base': 'Stage ID must be a number',
    'number.integer': 'Stage ID must be an integer'
  }),

  therapeuticArea: joi.number().integer().strict().required().messages({
    'any.required': 'Therapeutic Area ID is required',
    'number.base': 'Therapeutic Area ID must be a number',
    'number.integer': 'Therapeutic Area ID must be an integer'
  }),

  userId: joi.number().integer().strict().required().messages({
    'any.required': 'User ID is required',
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer'
  }),

  dealLead: joi.number().integer().strict().required().messages({
    'any.required': 'Deal lead is required',
    'number.base': 'Deal Lead ID must be a number',
    'number.integer': 'Deal Lead ID must be an integer'
  })
});

module.exports = {
  createDealRequest
};
