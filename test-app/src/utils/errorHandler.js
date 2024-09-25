const {
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError,
  DatabaseError,
  BaseError
} = require('sequelize');
const statusCodes = require('../config/statusCodes');
const CustomError = require('./customError');

class ErrorHandler {
  static handle(error) {
    if (error instanceof CustomError) {
      return this.handleGenericError(error);
    }

    if (error instanceof UniqueConstraintError) {
      return this.handleUniqueConstraintError(error);
    }

    if (error instanceof ForeignKeyConstraintError) {
      return this.handleForeignKeyConstraintError(error);
    }

    if (error instanceof ValidationError) {
      return this.handleValidationError(error);
    }

    if (error instanceof DatabaseError) {
      return this.handleDatabaseError(error);
    }

    // Handle other Sequelize errors
    if (error instanceof BaseError) {
      return this.handleSequelizeError(error);
    }

    return this.handleGenericError(error);
  }

  static handleUniqueConstraintError(error) {
    const message = error.errors[0]?.message || 'Unique constraint error.';
    // const detail = 'A record with this value already exists.';
    throw new CustomError(message, statusCodes.CONFLICT);
  }

  static handleForeignKeyConstraintError(error) {
    const table = error.table || 'related entity';
    const message = `Invalid reference to ${table}.`;
    // const detail = 'The referenced record does not exist.';
    throw new CustomError(message, statusCodes.BAD_REQUEST);
  }

  static handleValidationError(error) {
    const err = error.errors[0]; // Get the first validation error
    const message = 'Validation failed.';
    // const detail = err.message || 'Invalid input.';
    throw new CustomError(message, statusCodes.BAD_REQUEST);
  }

  static handleDatabaseError(error) {
    const message = 'A database error occurred.';
    // const detail = 'Please try again later.';
    throw new CustomError(message, statusCodes.SERVER_ERROR);
  }

  static handleSequelizeError(error) {
    const message = error.message || 'An unexpected database error occurred.';
    // const detail = 'Please contact support.';
    throw new CustomError(message, statusCodes.INTERNAL_SERVER_ERROR);
  }

  static handleGenericError(error) {
    const message = error.message || 'An unexpected error occurred.';
    // const detail = 'Please contact support.';
    throw new CustomError(
      message,
      error.statusCode || statusCodes.SERVER_ERROR
    );
  }
}

module.exports = ErrorHandler;
