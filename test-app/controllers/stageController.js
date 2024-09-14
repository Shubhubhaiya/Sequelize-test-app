const statusCodes = require('../config/statusCodes');
const stageService = require('../services/stageService');
const responseCodes = require('../utils/responseCode');

const getList = async (req, res) => {
  try {
    const result = await stageService.getAllStages(req.query);
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
