const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const {
  assignTherapeuticAreasRequest
} = require('../models/request/assignTherapeuticAreasRequest');

// Middleware for validating the request body for assigning therapeutic areas
const validateAssignTherapeuticAreas = (req, res, next) => {
  const { error } = assignTherapeuticAreasRequest.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateAssignTherapeuticAreas;
