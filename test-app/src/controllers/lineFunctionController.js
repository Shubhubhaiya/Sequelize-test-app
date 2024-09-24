const statusCodes = require('../config/statusCodes');
const lineFunctionService = require('../services/lineFunctionService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res) => {
  try {
    const { data, pagination } = await lineFunctionService.getAllLineFunctions(
      req.query
    );
    if (!data || data.length === 0) {
      return res.status(statusCodes.NO_CONTENT).send();
    }
    const successResponse = apiResponse.success(data, pagination);

    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    const statusCode = error.statusCode || statusCodes.SERVER_ERROR;
    const errorMessage = error.message || statusCodes.SERVER_ERROR;
    const errorDetails = error.details || {};

    const errorResponse = apiResponse.error(errorMessage, errorDetails);
    return res.status(statusCode).send(errorResponse);
  }
};

module.exports = {
  getList
};
