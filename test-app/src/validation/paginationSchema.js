const joi = require('joi');

const paginationSchema = joi.object({
  page: joi
    .number()
    .integer()
    .min(1)
    .default(1)
    .description('Page number must be a positive integer'),
  limit: joi
    .number()
    .integer()
    .min(0)
    .default(null)
    .description(
      'Limit must be a non-negative integer, where 0 or null fetches all records'
    ),
  userId: joi
    .number()
    .integer()
    .optional()
    .description('Optional user ID for filtering')
});

module.exports = {
  paginationSchema
};
