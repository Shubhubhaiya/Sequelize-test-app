// src/utils/errorHandler.js

const { Sequelize } = require('sequelize');
const apiResponse = require('./apiResponse');

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
    const field = error.errors[0]?.path || 'field';
    const value = error.errors[0]?.value || 'value';
    return apiResponse.badRequest({
      // message: `The value "${value}" for ${field} must be unique.`
      message: error.errors[0].message
    });
  }

  static handleForeignKeyConstraintError(error) {
    const table = error.table || 'related entity';
    return apiResponse.badRequest({
      message: `Invalid reference. The specified ${table} does not exist.`
    });
  }

  static handleValidationError(error) {
    const messages = error.errors.map((err) => err.message);
    return apiResponse.badRequest({
      message: 'Validation failed.',
      details: messages
    });
  }

  static handleDatabaseError(error) {
    return apiResponse.serverError({
      message: 'A database error occurred.'
    });
  }

  static handleGenericError(error) {
    return apiResponse.serverError({
      message: error.message || 'An unexpected error occurred.'
    });
  }
}

module.exports = SequelizeErrorHandler;
