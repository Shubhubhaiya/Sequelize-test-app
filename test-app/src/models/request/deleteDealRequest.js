const joi = require('joi');

// Define the schema for deleteDealRequest (strict, no additional params allowed)
const deleteDealRequest = {
  params: joi.object({
    id: joi.number().integer().required().messages({
      'any.required': 'Deal ID is required',
      'number.base': 'Deal ID must be a number',
      'number.integer': 'Deal ID must be an integer'
    })
  }),

  query: joi
    .object({
      userId: joi.number().integer().required().messages({
        'any.required': 'User ID is required',
        'number.base': 'User ID must be a number',
        'number.integer': 'User ID must be an integer'
      })
    })
    .unknown(false) // Disallow additional query parameters
};

module.exports = {
  deleteDealRequest
};
