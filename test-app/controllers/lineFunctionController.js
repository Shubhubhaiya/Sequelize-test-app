const statusCodes = require('../config/statusCodes');
const lineFunctionService = require('../services/lineFunctionService');
const responseCodes = require('../utils/responseCode');

const getList = async (req, res) => {
  try {
    const result = await lineFunctionService.getAllLineFunctions(req.query);
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    const response = new responseCodes();
    const result = response.serverError(
      'Unexpected error occurred.',
      error.message
    );
    return res.status(statusCodes.SERVER_ERROR).send(result);
  }
};

module.exports = {
  getList
};
