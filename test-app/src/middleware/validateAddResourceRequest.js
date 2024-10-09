const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const { addResourceRequest } = require('../models/request/addResourceRequest');

// Middleware for validating the request body for adding a resource
const validateAddResourceSchema = (req, res, next) => {
  const { error } = addResourceRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateAddResourceSchema;
