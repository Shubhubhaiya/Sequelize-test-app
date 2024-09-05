const statusCodes = require('../config/statusCodes');

class ResponseCodes {
  success(data = [], message = 'Request was successful', pagination = null) {
    const response = {
      status: statusCodes.SUCCESS,
      message: message,
      data: data,
      error: {}
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return response;
  }

  badRequest(
    message = 'Oops! Invalid request, please recheck information!',
    error = {}
  ) {
    return {
      status: statusCodes.BAD_REQUEST,
      message: message,
      data: [],
      error: error
    };
  }

  dataNotFound(message = 'Oops! Resource not found, try something different!') {
    return {
      status: statusCodes.NOT_FOUND,
      message: message,
      data: [],
      error: {}
    };
  }

  unauthorized(message = 'Sorry! Unauthorized access requested!', error = {}) {
    return {
      status: statusCodes.UNAUTHORIZED,
      message: message,
      data: [],
      error: error
    };
  }

  forbidden(message = 'Oops! Forbidden access', error = {}) {
    return {
      status: statusCodes.FORBIDDEN,
      message: message,
      data: [],
      error: error
    };
  }

  serverError(
    message = 'Due to some technical issue we cannot process your request, please check back later!',
    error = {}
  ) {
    return {
      status: statusCodes.SERVER_ERROR,
      message: message,
      data: [],
      error: error
    };
  }

  serverUnavailable(
    message = 'Sorry! Our servers are down right now, please check back later!',
    error = {}
  ) {
    return {
      status: statusCodes.SERVICE_UNAVAILABLE,
      message: message,
      data: [],
      error: error
    };
  }
}

module.exports = ResponseCodes;
