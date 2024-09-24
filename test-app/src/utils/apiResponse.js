const responseMessages = require('../config/responseMessages');

class ApiResponse {
  constructor() {
    this.data = null;
    this.error = null;
  }

  // Formats a success response
  static success(data = [], pagination = null, message = null) {
    const response = new ApiResponse();
    response.data = data;

    if (pagination) response.pagination = pagination;
    if (message) response.message = message;

    return response;
  }

  // Formats an error response
  static error(message, errorDetails = {}) {
    const response = new ApiResponse();
    response.error = { message, ...errorDetails };
    return response;
  }

  // Helper methods for common errors using responseMessages
  static badRequest(errorDetails = {}) {
    return ApiResponse.error(responseMessages.BAD_REQUEST, errorDetails);
  }

  static dataNotFound(errorDetails = {}) {
    return ApiResponse.error(responseMessages.DATA_NOT_FOUND, errorDetails);
  }

  static unauthorized(errorDetails = {}) {
    return ApiResponse.error(responseMessages.UNAUTHORIZED, errorDetails);
  }

  static forbidden(errorDetails = {}) {
    return ApiResponse.error(responseMessages.FORBIDDEN, errorDetails);
  }

  static serverError(errorDetails = {}) {
    return ApiResponse.error(responseMessages.SERVER_ERROR, errorDetails);
  }

  static serverUnavailable(errorDetails = {}) {
    return ApiResponse.error(responseMessages.SERVER_UNAVAILABLE, errorDetails);
  }

  static conflict(errorDetails = {}) {
    return ApiResponse.error(responseMessages.CONFLICT, errorDetails);
  }
}

module.exports = ApiResponse;
