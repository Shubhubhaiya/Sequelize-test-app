const statusCodes = require('../config/statusCodes');
const stageService = require('../services/stageService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res) => {
  try {
    const result = await stageService.getAllStages(req.query);
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    const result = apiResponse.serverError({ message: error.message });
    return res.status(statusCodes.SERVER_ERROR).send(result);
  }
};

module.exports = {
  getList
};
