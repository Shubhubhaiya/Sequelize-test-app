const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const auditTrailRequestSchema = require('../models/request/auditTrailRequest');

// Middleware for validating the request body for audit trail
const validateAuditTrailSchema = (req, res, next) => {
  const { error } = auditTrailRequestSchema.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateAuditTrailSchema;
