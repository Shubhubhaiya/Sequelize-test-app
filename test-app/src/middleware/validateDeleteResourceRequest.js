const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const {
  deleteResourceRequest
} = require('../models/request/deleteResourceRequest');

// Middleware to validate the deleteDeal request
const validateDeleteResourceSchema = (req, res, next) => {
  const { error: paramsError } = deleteResourceRequest.params.validate(
    req.params
  );
  if (paramsError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(
        apiResponse.badRequest({ message: paramsError.details[0].message })
      );
  }

  // Validate query (userId)
  const { error: queryError } = deleteResourceRequest.query.validate(
    req.query,
    {}
  );
  if (queryError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: queryError.details[0].message }));
  }

  // If both params and query validation pass, proceed
  next();
};

module.exports = validateDeleteResourceSchema;
