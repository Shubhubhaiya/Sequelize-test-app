const responseMessages = {
  BAD_REQUEST: 'Oops! Invalid request, please recheck information!',
  DATA_NOT_FOUND: 'Oops! Resource not found, try something different!',
  UNAUTHORIZED: 'Sorry! Unauthorized access requested!',
  FORBIDDEN: 'Oops! Forbidden access',
  SERVER_ERROR: 'Some internal server error occured!',
  SERVER_UNAVAILABLE:
    'Sorry! Our servers are down right now, please check back later!',
  CONFLICT: 'The resource already exists'
};

module.exports = responseMessages;
