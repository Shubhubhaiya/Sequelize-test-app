const joi = require('joi');

const filtersSchema = joi.object({
  lineFunction: joi.array().items(joi.number().integer()).optional(),
  stage: joi.array().items(joi.number().integer()).optional(),
  name: joi.string().empty('').allow(null).optional(),
  title: joi.string().empty('').allow(null).optional(),
  email: joi.string().empty('').allow(null).optional(),
  vdrAccessRequested: joi.boolean().optional(),
  webTrainingStatus: joi.array().items(joi.string()).optional(),
  novartis521ID: joi.string().empty('').allow(null).optional(),
  isCoreTeamMember: joi.boolean().optional(),
  oneToOneDiscussion: joi.string().empty('').allow(null).optional(),
  optionalColumn: joi.string().empty('').allow(null).optional(),
  siteCode: joi.string().empty('').allow(null).optional()
});

const listResourcesRequest = joi.object({
  userId: joi.number().integer().required(),
  dealId: joi.number().integer().required(),
  filters: filtersSchema.optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).default(10)
});

module.exports = listResourcesRequest;
