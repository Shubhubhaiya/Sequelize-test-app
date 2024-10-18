const Joi = require('joi');
const { webTrainingStatus } = require('../../config/webTrainingStatus');

// Joi schema for validating update resource request
const updateResourceRequest = Joi.object({
  dealId: Joi.number().required().messages({
    'any.required': 'Deal ID is required',
    'number.base': 'Deal ID must be a number'
  }),
  stageId: Joi.number().required().messages({
    'any.required': 'Stage ID is required',
    'number.base': 'Stage ID must be a number'
  }),
  userId: Joi.number().required().messages({
    'any.required': 'User ID is required',
    'number.base': 'User ID must be a number'
  }),
  resourceData: Joi.object({
    resourceId: Joi.number().required().messages({
      'any.required': 'Resource ID is required',
      'number.base': 'Resource ID must be a number'
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required',
      'string.email': 'Invalid email format'
    }),
    vdrAccessRequested: Joi.boolean().required().messages({
      'any.required': 'VDR access requested status is required'
    }),
    webTrainingStatus: Joi.string()
      .valid(
        webTrainingStatus.NOT_STARTED,
        webTrainingStatus.IN_PROGRESS,
        webTrainingStatus.COMPLETED
      )
      .required()
      .messages({
        'any.required': 'Web training status is required'
      }),
    oneToOneDiscussion: Joi.string().allow(null, '').optional(),
    optionalColumn: Joi.string().allow(null, '').optional(),
    isCoreTeamMember: Joi.boolean().required().messages({
      'any.required': 'Core team member status is required'
    }),
    lineFunction: Joi.number().required().messages({
      'any.required': 'Line function is required',
      'number.base': 'Line function must be a number'
    })
  }).required()
}).unknown(false);

module.exports = {
  updateResourceRequest
};
