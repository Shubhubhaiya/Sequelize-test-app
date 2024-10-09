const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const resourceListRequest = require('../models/request/resourceListRequest');

// Middleware for validating the request body for resource list
const validateResourceListSchema = (req, res, next) => {
  const { error } = resourceListRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateResourceListSchema;
