const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const {
  unAssignTherapeuticAreaRequest
} = require('../models/request/unAssignTherapeuticAreaRequest');

// Middleware for validating the request body for assigning therapeutic areas
const validateUnassignTherapeuticAreas = (req, res, next) => {
  const { error } = unAssignTherapeuticAreaRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateUnassignTherapeuticAreas;
