const { LineFunction } = require('../database/models');
const baseService = require('./baseService');
const sequelizeErrorHandler = require('../utils/sequelizeErrorHandler');

class LineFunctionService extends baseService {
  constructor() {
    super(LineFunction);
  }

  async getAllLineFunctions(query) {
    try {
      const { data, pagination } = await this.findAndCountAll(query);
      return { data, pagination };
    } catch (error) {
      sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new LineFunctionService();
