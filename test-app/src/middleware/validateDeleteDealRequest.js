const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const { deleteDealRequest } = require('../models/request/deleteDealRequest');

// Middleware to validate the deleteDeal request
const validateDeleteDealRequestSchema = (req, res, next) => {
  const { error: paramsError } = deleteDealRequest.params.validate(req.params);
  if (paramsError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(
        apiResponse.badRequest({ message: paramsError.details[0].message })
      );
  }

  // Validate query (userId) and ensure no additional query params are allowed
  const { error: queryError } = deleteDealRequest.query.validate(req.query, {
    allowUnknown: false
  }); // strictly disallow unknown query params
  if (queryError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: queryError.details[0].message }));
  }

  // If both params and query validation pass, proceed
  next();
};

module.exports = validateDeleteDealRequestSchema;
