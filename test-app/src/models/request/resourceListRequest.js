const joi = require('joi');

const filtersSchema = joi.object({
  lineFunction: joi.array().items(joi.number().integer()).optional(),
  stage: joi.array().items(joi.number().integer()).optional(),
  name: joi.string().optional(),
  title: joi.string().optional(),
  email: joi.string().optional(),
  vdrAccessRequested: joi.boolean().optional(),
  webTrainingStatus: joi.array().items(joi.string()).optional(),
  novartis521ID: joi.string().optional(),
  isCoreTeamMember: joi.boolean().optional(),
  oneToOneDiscussion: joi.string().optional(),
  optionalColumn: joi.string().optional(),
  siteCode: joi.string().optional()
});

const listResourcesRequest = joi.object({
  userId: joi.number().integer().required(),
  dealId: joi.number().integer().required(),
  filters: filtersSchema.optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).default(10)
});

module.exports = listResourcesRequest;
