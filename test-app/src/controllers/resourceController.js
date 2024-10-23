const statusCodes = require('../config/statusCodes');
const { addResourceRequest } = require('../models/request/addResourceRequest');
const resourceService = require('../services/resourceService');
const apiResponse = require('../utils/apiResponse');

const addResource = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const dealId = req.body.dealId;
    const resources = req.body.resources;

    // Call the service to add the resource(s)
    const result = await resourceService.addResource(dealId, userId, resources);

    // If there are failed resources, return a 400 Bad Request
    if (result.failedResources && result.failedResources.length > 0) {
      return res.status(statusCodes.SERVER_ERROR).json(result);
    }
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
