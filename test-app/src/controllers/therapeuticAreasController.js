const statusCodes = require('../config/statusCodes');
const therapeuticAreaService = require('../services/therapeuticAreaService');
const apiResponse = require('../utils/apiResponse');

const getList = async (req, res) => {
  try {
    const result = await therapeuticAreaService.getAllTherapeuticAreas(
      req.query
    );
    return res.status(statusCodes.SUCCESS).send(result);
  } catch (error) {
    const result = apiResponse.serverError({ message: error.message });
    return res.status(statusCodes.SERVER_ERROR).send(result);
  }
};

module.exports = {
  getList
};
