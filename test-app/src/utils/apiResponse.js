const responseMessages = require('../config/responseMessages');

class ApiResponse {
  // Formats a success response
  static success(data = null, pagination = null, message = null) {
    const response = {};

    if (data) {
      response.data = data;
    }

    if (pagination) {
      Object.assign(response, pagination);
    }

    if (message) response.message = message;

    return response;
  }

  // Formats an error response
  static error(message = 'An error occurred.') {
    return message;
  }

  // Helper methods for common errors using responseMessages
  static badRequest(message = 'Bad Request') {
    return ApiResponse.error(message);
  }

  static unauthorized(message = 'Unauthorized') {
    return ApiResponse.error(message);
  }

  static forbidden(message = 'Forbidden') {
    return ApiResponse.error(message);
  }

  static notFound(message = 'Not Found') {
    return ApiResponse.error(message);
  }

  static conflict(message = 'Conflict') {
    return ApiResponse.error(message);
  }

  static internalError(message = 'Internal Server Error') {
    return ApiResponse.error(message);
  }

  // Add other helper methods as needed...
}

module.exports = ApiResponse;
