const responseMessages = require('../config/responseMessages');
const statusCodes = require('../config/statusCodes');
const apiResponse = require('../utils/apiResponse');

function errorHandlerMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || statusCodes.SERVER_ERROR;
  const message = error.message || responseMessages.SERVER_ERROR;
  const detail = error.details || null;
  res.status(statusCode).json(apiResponse.error({ message, detail }));
}

module.exports = errorHandlerMiddleware;
