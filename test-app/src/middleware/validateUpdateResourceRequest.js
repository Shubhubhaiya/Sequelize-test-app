const statusCodes = require('../config/statusCodes');
const {
  updateResourceRequest
} = require('../models/request/updateResourceRequest');
const apiResponse = require('../utils/apiResponse');

// Middleware for validating the update resource request
const validateUpdateResourceSchema = (req, res, next) => {
  const { error } = updateResourceRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateUpdateResourceSchema;
