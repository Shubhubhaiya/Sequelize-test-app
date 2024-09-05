class ResponseCodes {
  success(data = [], message = 'Request was successful', pagination = null) {
    const response = {
      status: 200,
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
      status: 400,
      message: message,
      data: [],
      error: error
    };
  }

  dataNotFound(message = 'Oops! Resource not found, try something different!') {
    return {
      status: 404,
      message: message,
      data: [],
      error: {}
    };
  }

  unauthorized(message = 'Sorry! Unauthorized access requested!', error = {}) {
    return {
      status: 401,
      message: message,
      data: [],
      error: error
    };
  }

  forbidden(message = 'Oops! Forbidden access', error = {}) {
    return {
      status: 403,
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
      status: 500,
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
      status: 503,
      message: message,
      data: [],
      error: error
    };
  }
}

module.exports = ResponseCodes;
