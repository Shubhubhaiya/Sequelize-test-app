const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const {
  deleteResourceRequest
} = require('../models/request/deleteResourceRequest');

// Middleware to validate the deleteDeal request
const validateDeleteResourceSchema = (req, res, next) => {
  const { error } = deleteResourceRequest.body.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateDeleteResourceSchema;
