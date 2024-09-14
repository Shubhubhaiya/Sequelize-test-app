const statusCodes = require('../config/statusCodes');

class ResponseCodes {
  success(data = [], pagination = null) {
    const response = {
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
      message: message,
      data: [],
      error: error
    };
  }

  dataNotFound(message = 'Oops! Resource not found, try something different!') {
    return {
      message: message,
      data: [],
      error: {}
    };
  }

  unauthorized(message = 'Sorry! Unauthorized access requested!', error = {}) {
    return {
      message: message,
      data: [],
      error: error
    };
  }

  forbidden(message = 'Oops! Forbidden access', error = {}) {
    return {
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
      message: message,
      data: [],
      error: error
    };
  }
}

module.exports = ResponseCodes;
