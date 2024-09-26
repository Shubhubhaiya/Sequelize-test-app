const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const dealListRequest = require('../models/request/dealListRequest');

// Middleware for validating the request body for create deal
const validateDealListSchema = (req, res, next) => {
  const { filters } = req.body;
  const { error } = dealListRequest.validate(filters);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateDealListSchema;
