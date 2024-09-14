const statusCodes = require('../config/statusCodes');
const lineFunctionService = require('../services/lineFunctionService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res) => {
  try {
    const result = await lineFunctionService.getAllLineFunctions(req.query);
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    const result = apiResponse.serverError({ message: error.message });
    return res.status(statusCodes.SERVER_ERROR).send(result);
  }
};

module.exports = {
  getList
};
