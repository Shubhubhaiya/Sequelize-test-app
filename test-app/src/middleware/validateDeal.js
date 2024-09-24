const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const { createDealRequest } = require('../models/request/createDealRequest');

// Middleware for validating the request body for create deal
const validateCreateDealSchema = (req, res, next) => {
  const { error } = createDealRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateCreateDealSchema;
