const Joi = require('joi');

const filtersSchema = Joi.object({
  lineFunction: Joi.array()
    .items(Joi.number().integer())
    .allow(null)
    .optional(),
  stage: Joi.array().items(Joi.number().integer()).allow(null).optional(),
  name: Joi.string().empty('').allow(null).optional(),
  title: Joi.string().empty('').allow(null).optional(),
  email: Joi.string().empty('').allow(null).optional(),
  vdrAccessRequested: Joi.boolean().allow(null).optional(),
  webTrainingStatus: Joi.array().items(Joi.string()).allow(null).optional(),
  novartis521ID: Joi.string().empty('').allow(null).optional(),
  isCoreTeamMember: Joi.boolean().allow(null).optional(),
  oneToOneDiscussion: Joi.string().empty('').allow(null).optional(),
  optionalColumn: Joi.string().empty('').allow(null).optional(),
  siteCode: Joi.string().empty('').allow(null).optional()
});

const listResourcesRequest = Joi.object({
  userId: Joi.number().integer().required(),
  dealId: Joi.number().integer().required(),
  filters: filtersSchema.allow(null).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

module.exports = listResourcesRequest;
