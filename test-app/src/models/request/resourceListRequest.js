const Joi = require('joi');

// Define the schema for filters
const filtersSchema = Joi.object({
  // Filter by lineFunction IDs (array of integers)
  lineFunction: Joi.array()
    .items(Joi.number().integer())
    .allow(null)
    .optional(),

  // Filter by stage IDs (array of integers)
  stage: Joi.array().items(Joi.number().integer()).allow(null).optional(),

  // Filter by resource name (first name, last name, or full name)
  name: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by resource title
  title: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by resource email address
  email: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by VDR Access Requested status (boolean)
  vdrAccessRequested: Joi.boolean().allow(null).optional(),

  // Filter by web training status (array of specific status strings)
  webTrainingStatus: Joi.array()
    .items(Joi.string().valid('Not Started', 'In-progress', 'completed'))
    .allow(null)
    .optional(),

  // Filter by Novartis 521 ID (string identifier)
  novartis521ID: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by Core Team Member status (boolean)
  isCoreTeamMember: Joi.boolean().allow(null).optional(),

  // Filter by one-to-one discussion notes (text)
  oneToOneDiscussion: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by optional column (additional notes or data) (text)
  optionalColumn: Joi.string().trim().empty('').allow(null).optional(),

  // Filter by site code (e.g., office location) (text)
  siteCode: Joi.string().trim().empty('').allow(null).optional()
});

// Define the main request schema
const listResourcesRequest = Joi.object({
  // ID of the user making the request (integer, required)
  userId: Joi.number().integer().required(),

  // ID of the deal to filter resources (integer, required)
  dealId: Joi.number().integer().required(),

  // Filters object containing various optional filtering criteria
  filters: filtersSchema.allow(null).optional(),

  // Pagination: page number (integer, minimum 1, default is 1)
  page: Joi.number().integer().min(1).default(1),

  // Pagination: number of records per page (integer, minimum 1, default is 10)
  limit: Joi.number().integer().min(1).default(10)
});

module.exports = listResourcesRequest;
