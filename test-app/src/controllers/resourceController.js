const statusCodes = require('../config/statusCodes');
const { addResourceRequest } = require('../models/request/addResourceRequest');
const resourceService = require('../services/resourceService');
const apiResponse = require('../utils/apiResponse');

const addResource = async (req, res, next) => {
  try {
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

// List all resources of deal
const listResources = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const result = await resourceService.getResourceList(
      { page, limit },
      req.body
    );
    return res.status(statusCodes.SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};

// Delete Resource
const deleteResource = async (req, res, next) => {
  try {
    // Extract data from request params and query
    const { resourceId, stageId, dealId } = req.params;
    const { userId } = req.query;

    // Call the service to soft delete the resource from the stage
    const result = await resourceService.removeResourceFromStage({
      dealId,
      stageId,
      resourceId,
      userId
    });

    return res.status(statusCodes.SUCCESS).json(apiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

// Get Resource Detail
const getResourceDetail = async (req, res, next) => {
  try {
    const { resourceId, dealId, stageId } = req.query;

    const resourceDetail = await resourceService.getResourceDetail(
      resourceId,
      dealId,
      stageId
    );

    return res
      .status(statusCodes.SUCCESS)
      .json(apiResponse.success(resourceDetail));
  } catch (error) {
    next(error);
  }
};

// Update resource
const updateResource = async (req, res, next) => {
  try {
    const { dealId, stageId, resourceData, userId } = req.body;
    const result = await resourceService.updateResource(
      dealId,
      stageId,
      userId,
      resourceData
    );
    return res.status(statusCodes.SUCCESS).json(result);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addResource,
  listResources,
  deleteResource,
  getResourceDetail,
  updateResource
};
