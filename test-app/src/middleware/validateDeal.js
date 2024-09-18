const { createDealSchema } = require('../validation/createDealSchema');
const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');

// Middleware for validating the request body for create deal
const validateCreateDealSchema = (req, res, next) => {
  const { error } = createDealSchema.validate(req.body);

  if (error) {
    return res
      .status(statusCodes.BAD_REQUEST)
      .send(apiResponse.badRequest({ message: error.details[0].message }));
  }

  next();
};

module.exports = validateCreateDealSchema;
