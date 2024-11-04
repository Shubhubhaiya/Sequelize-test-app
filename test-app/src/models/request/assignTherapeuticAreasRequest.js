const joi = require('joi');

const assignTherapeuticAreasRequest = joi
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
    therapeuticAreaIds: joi.array().items(joi.number().integer()).messages({
      'array.base': 'Therapeutic Area IDs must be an array.',
      'number.base': 'Each Therapeutic Area ID must be a number.',
      'number.integer': 'Each Therapeutic Area ID must be an integer.'
    }),
    unassignTA: joi.array().items(joi.number().integer()).messages({
      'array.base': 'Therapeutic Area IDs must be an array.',
      'number.base': 'Each Therapeutic Area ID must be a number.',
      'number.integer': 'Each Therapeutic Area ID must be an integer.'
    })
  })
  .custom((value, helpers) => {
    if (
      (!value.therapeuticAreaIds || value.therapeuticAreaIds.length === 0) &&
      (!value.unassignTA || value.unassignTA.length === 0)
    ) {
      return helpers.message(
        'You must assign or unassign at least one Therapeutic Area.'
      );
    }
    return value;
  })
  .options({ convert: false }); // Add convert: false to prevent coercion

module.exports = {
  assignTherapeuticAreasRequest
};
