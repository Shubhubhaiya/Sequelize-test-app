const statusCodes = require('../config/statusCodes');
const stageService = require('../services/stageService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res, next) => {
  try {
    const { data, pagination } = await stageService.getAllStages(req.query);
    const successResponse = apiResponse.success(data, pagination);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getList
};
