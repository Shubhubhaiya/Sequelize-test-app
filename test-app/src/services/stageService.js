const { Stage } = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');

class StageService extends baseService {
  constructor() {
    super(Stage);
  }

  async getAllStages(query) {
    const { data, pagination } = await this.findAndCountAll(query);

    if (data.length === 0) {
      return apiResponse.success();
    }

    return apiResponse.success(data, pagination);
  }
}

module.exports = new StageService();
