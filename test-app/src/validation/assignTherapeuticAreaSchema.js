const joi = require('joi');

const assignTherapeuticAreasSchema = joi
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
    therapeuticAreaIds: joi
      .array()
      .items(joi.number().integer().required())
      .min(1)
      .required()
      .messages({
        'array.base': 'Therapeutic Area IDs must be an array.',
        'array.min':
          'Therapeutic Area IDs array must contain at least one item.',
        'any.required': 'Therapeutic Area IDs are required.',
        'number.base': 'Each Therapeutic Area ID must be a number.',
        'number.integer': 'Each Therapeutic Area ID must be an integer.'
      })
  })
  .options({ convert: false }); // Add convert: false to prevent coercion

module.exports = {
  assignTherapeuticAreasSchema
};
