const responseMessages = require('../config/responseMessages');
const statusCodes = require('../config/statusCodes');

class ApiResponse {
  constructor() {
    this.data = null;
    this.error = null;
    this.pagination = null;
    this.status = null;
  }

  static success(data = [], pagination = null) {
    const response = new ApiResponse();
    response.data = data;
    response.status = statusCodes.SUCCESS;
    if (pagination) {
      response.pagination = pagination;
    }
    return response;
  }

  static error(message, statusCode = 500, errorDetails = {}) {
    const response = new ApiResponse();
    response.error = {
      message,
      ...errorDetails
    };
    response.status = statusCode;
    return response;
  }

  static badRequest(errorDetails = {}) {
    return ApiResponse.error(
      responseMessages.BAD_REQUEST,
      statusCodes.BAD_REQUEST,
      errorDetails
    );
  }

  static dataNotFound() {
    return ApiResponse.error(
      responseMessages.DATA_NOT_FOUND,
      statusCodes.NOT_FOUND
    );
  }

  static unauthorized(errorDetails = {}) {
    return ApiResponse.error(
      responseMessages.UNAUTHORIZED,
      statusCodes.UNAUTHORIZED,
      errorDetails
    );
  }

  static forbidden(errorDetails = {}) {
    return ApiResponse.error(
      responseMessages.FORBIDDEN,
      statusCodes.FORBIDDEN,
      errorDetails
    );
  }

  static serverError(errorDetails = {}) {
    return ApiResponse.error(
      responseMessages.SERVER_ERROR,
      statusCodes.SERVER_ERROR,
      errorDetails
    );
  }

  static serverUnavailable(errorDetails = {}) {
    return ApiResponse.error(
      responseMessages.SERVER_UNAVAILABLE,
      statusCodes.SERVICE_UNAVAILABLE,
      errorDetails
    );
  }
}

module.exports = ApiResponse;
