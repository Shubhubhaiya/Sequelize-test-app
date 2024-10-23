const apiResponse = require('../utils/apiResponse');
const statusCodes = require('../config/statusCodes');
const { addResourceRequest } = require('../models/request/addResourceRequest');

// Middleware for validating the request body for adding a resource
const validateAddResourceSchema = (req, res, next) => {
  const { error } = addResourceRequest.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    // Create a more user-friendly error message
    const errorMessages = error.details.map((errDetail) => {
      // Adjust index to be human-readable (1-based index)
      const pathArray = errDetail.path;
      if (pathArray[0] === 'resources' && typeof pathArray[1] === 'number') {
        const humanIndex = pathArray[1] + 1; // Convert 0-based index to 1-based index
        return `resource ${humanIndex}: ${errDetail.message.replace(`resources[${pathArray[1]}]`, `resource ${humanIndex}`)}`;
      }
      return `Validation error: ${errDetail.message}`;
    });

    return res.status(statusCodes.BAD_REQUEST).json(
      apiResponse.badRequest({
        message: errorMessages // Send errors as an array to preserve newlines
      })
    );
  }
  next();
};

module.exports = validateAddResourceSchema;
