const { Stage } = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const sequelizeErrorHandler = require('../utils/sequelizeErrorHandler');

class StageService extends baseService {
  constructor() {
    super(Stage);
  }

  async getAllStages(query) {
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

module.exports = new StageService();
