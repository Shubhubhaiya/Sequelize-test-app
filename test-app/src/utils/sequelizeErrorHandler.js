const { Sequelize } = require('sequelize');
const statusCodes = require('../config/statusCodes');

class SequelizeErrorHandler {
  static handle(error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      return this.handleUniqueConstraintError(error);
    }

    if (error instanceof Sequelize.ForeignKeyConstraintError) {
      return this.handleForeignKeyConstraintError(error);
    }

    if (error instanceof Sequelize.ValidationError) {
      return this.handleValidationError(error);
    }

    if (error instanceof Sequelize.DatabaseError) {
      return this.handleDatabaseError(error);
    }

    // Generic error for other cases
    return this.handleGenericError(error);
  }

  static handleUniqueConstraintError(error) {
    const message = error.errors[0]?.message || 'Unique constraint error.';
    const err = new Error(message);
    err.statusCode = statusCodes.BAD_REQUEST;
    throw err;
  }

  static handleForeignKeyConstraintError(error) {
    const table = error.table || 'related entity';
    const message = `Invalid reference. The specified ${table} does not exist.`;
    const err = new Error(message);
    err.statusCode = statusCodes.BAD_REQUEST;
    throw err;
  }

  static handleValidationError(error) {
    const messages = error.errors.map((err) => err.message);
    const message = 'Validation failed.';
    const err = new Error(message);
    err.statusCode = statusCodes.BAD_REQUEST;
    err.details = messages;
    throw err;
  }

  static handleDatabaseError(error) {
    const message = 'A database error occurred.';
    const err = new Error(message);
    err.statusCode = statusCodes.SERVER_ERROR;
    throw err;
  }

  static handleGenericError(error) {
    const message = error.message || 'An unexpected error occurred.';
    const err = new Error(message);
    err.statusCode = error.statusCode || statusCodes.SERVER_ERROR;
    throw err;
  }
}

module.exports = SequelizeErrorHandler;
