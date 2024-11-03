const joi = require('joi');

const unAssignTherapeuticAreaRequest = joi
  .object({
    adminUserId: joi.number().integer().required().messages({
      'any.required': 'Admin user ID is required.',
      'number.base': 'Admin user ID must be a number.',
      'number.integer': 'Admin user ID must be an integer.'
    }),
    dealLeadId: joi.number().integer().required().messages({
      'any.required': 'Deal lead ID is required.',
      'number.base': 'Deal lead ID must be a number.',
      'number.integer': 'Deal lead ID must be an integer.'
    }),
    therapeuticAreaId: joi.number().integer().required().messages({
      'any.required': 'Therapeutic Area ID is required.',
      'number.base': 'Therapeutic Area ID must be a number.',
      'number.integer': 'Therapeutic Area ID must be an integer.'
    })
  })
  .options({ convert: false }); // Prevent coercion to other types

module.exports = {
  unAssignTherapeuticAreaRequest
};
