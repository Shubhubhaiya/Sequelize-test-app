const { paginationSchema } = require('../validation/paginationSchema');
const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');

const validatePagination = (req, res, next) => {
  const { error, value } = paginationSchema.validate(req.query);

  if (error) {
    // If validation fails, send a bad request response
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  // If limit is null, we fetch all records by setting limit to undefined
  if (value.limit === null) {
    value.limit = undefined;
  }

  // Replace query with validated values
  req.query = value;
  next();
};

module.exports = validatePagination;
