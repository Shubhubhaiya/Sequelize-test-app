const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const resourceDetailRequest = require('../models/request/resourceDetailRequest');

// Middleware to validate the resource detail request
const validateResourceDetailSchema = (req, res, next) => {
  // Validate query parameters (userId, resourceId, dealId)
  const { error: queryError } = resourceDetailRequest.query.validate(
    req.query,
    {
      allowUnknown: false // Disallow unknown query parameters
    }
  );

  if (queryError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: queryError.details[0].message }));
  }

  // If validation passes, proceed to the next middleware
  next();
};

module.exports = validateResourceDetailSchema;
