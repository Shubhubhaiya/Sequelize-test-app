const { LineFunction } = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const sequelizeErrorHandler = require('../utils/sequelizeErrorHandler');

class LineFunctionService extends baseService {
  constructor() {
    super(LineFunction);
  }

  async getAllLineFunctions(query) {
    try {
      const { data, pagination } = await this.findAndCountAll(query);

      if (data.length === 0) {
        return apiResponse.success();
      }

      return apiResponse.success(data, pagination);
    } catch (error) {
      return sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new LineFunctionService();
