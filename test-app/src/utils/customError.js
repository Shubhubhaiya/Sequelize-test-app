class CustomError extends Error {
  constructor(message, statusCode, detail = null) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
