const Joi = require('joi');

const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .description('Page number must be a positive integer'),
  limit: Joi.number()
    .integer()
    .min(0)
    .default(null)
    .description(
      'Limit must be a non-negative integer, where 0 or null fetches all records'
    ),
  userId: Joi.number()
    .integer()
    .optional()
    .description('Optional user ID for filtering')
});

module.exports = {
  paginationSchema
};
