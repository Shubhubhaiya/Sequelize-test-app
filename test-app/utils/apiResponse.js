const responseMessages = require('../config/responseMessages');

class ApiResponse {
  constructor() {
    this.data = null;
    this.error = null;
    this.pagination = null;
  }

  static success(data = [], pagination = null) {
    const response = new ApiResponse();
    response.data = data;
    if (pagination) {
      response.pagination = pagination;
    }
    return response;
  }

  static error(message, errorDetails = {}) {
    const response = new ApiResponse();
    response.error = {
      message,
      ...errorDetails
    };
    return response;
  }

  static badRequest(errorDetails = {}) {
    return ApiResponse.error(responseMessages.BAD_REQUEST, errorDetails);
  }

  static dataNotFound() {
    return ApiResponse.error(responseMessages.DATA_NOT_FOUND);
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
}

module.exports = ApiResponse;
