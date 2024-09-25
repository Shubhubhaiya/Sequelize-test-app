const joi = require('joi');
const statusCodes = require('../config/statusCodes');
const apiResponse = require('../utils/apiResponse');

// Middleware to validate route parameters
const validateRouteId = (req, res, next) => {
  const schema = joi.object({
    id: joi.number().integer().positive().required().messages({
      'number.base': 'ID must be a number.',
      'number.integer': 'ID must be an integer.',
      'number.positive': 'ID must be a positive number.',
      'any.required': 'ID is required.'
    })
  });

  const { error } = schema.validate({ id: req.params.id });

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateRouteId;
