const statusCodes = require('../config/statusCodes');
const lineFunctionService = require('../services/lineFunctionService');
const apiResponse = require('../utils/apiResponse');
const createUsers = require('../utils/createUsers');

const getList = async (req, res, next) => {
  try {
    createUsers();
    const { data, pagination } = await lineFunctionService.getAllLineFunctions(
      req.query
    );
    const successResponse = apiResponse.success(data, pagination);

    return res.status(statusCodes.SUCCESS).send(successResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getList
};
