const statusCodes = require('../config/statusCodes');
const auditTrailService = require('../services/auditTrailService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const { result, pagination } = await auditTrailService.getLogs(
      { page, limit },
      req.body
    );
    const successResponse = apiResponse.success(result, pagination);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getList
};
