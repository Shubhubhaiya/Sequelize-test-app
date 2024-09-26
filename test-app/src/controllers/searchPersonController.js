const statusCodes = require('../config/statusCodes');
const searchPersonService = require('../services/searchPersonService');
const apiResponse = require('../utils/apiResponse');

const searchPerson = async (req, res, next) => {
  try {
    const data = await searchPersonService.searchPerson(req.query);
    const successResponse = apiResponse.success(data);
    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchPerson
};
