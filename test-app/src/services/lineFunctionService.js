const { LineFunction } = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');

class LineFunctionService extends baseService {
  constructor() {
    super(LineFunction);
  }

  async getAllLineFunctions(query) {
    const { data, pagination } = await this.findAndCountAll(query);

    if (data.length === 0) {
      return apiResponse.success();
    }

    return apiResponse.success(data, pagination);
  }
}

module.exports = new LineFunctionService();
