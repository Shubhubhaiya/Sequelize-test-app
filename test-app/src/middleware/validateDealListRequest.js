const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const dealListRequest = require('../models/request/dealListRequest');

// Middleware for validating the request body for deal list
const validateDealListSchema = (req, res, next) => {
  const { error } = dealListRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateDealListSchema;
