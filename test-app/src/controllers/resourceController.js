const statusCodes = require('../config/statusCodes');
const { addResourceRequest } = require('../models/request/addResourceRequest');
const resourceService = require('../services/resourceService');
const apiResponse = require('../utils/apiResponse');

const addResource = async (req, res, next) => {
  try {
    // Perform validation for the request body
    const { error } = addResourceRequest.validate(req.body);
    if (error) {
      return res.status(statusCodes.BAD_REQUEST).send(
        apiResponse.badRequest({
          message: `Validation error: ${error.details[0].message}`
        })
      );
    }

    const userId = req.body.userId;
    const dealId = req.body.dealId;
    const resources = req.body.resources;

    // Call the service to add the resource(s)
    const result = await resourceService.addResource(dealId, userId, resources);
    return res.status(statusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addResource
};
