const statusCodes = require('../config/statusCodes');
const {
  deleteResourceRequest,
  deleteResourceQuery
} = require('../models/request/deleteResourceRequest');
const apiResponse = require('../utils/apiResponse');

const validateDeleteResourceSchema = (req, res, next) => {
  // Validate the path params (resourceId, stageId, dealId)
  const { error: paramsError } = deleteResourceRequest.validate(req.params);
  if (paramsError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(
        ApiResponse.badRequest({ message: paramsError.details[0].message })
      );
  }

  // Validate the query (userId)
  const { error: queryError } = deleteResourceQuery.validate(req.query);
  if (queryError) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: queryError.details[0].message }));
  }

  next();
};

module.exports = validateDeleteResourceSchema;
