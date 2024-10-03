const { LineFunction } = require('../database/models');
const baseService = require('./baseService');
const errorHandler = require('../utils/errorHandler');

class LineFunctionService extends baseService {
  constructor() {
    super(LineFunction);
  }

  async getAllLineFunctions(query) {
    try {
      const attributes = ['id', 'name'];
      const { data, pagination } = await this.findAndCountAll(query, {
        attributes
      });
      return { data, pagination };
    } catch (error) {
      errorHandler.handle(error);
    }
  }
}

module.exports = new LineFunctionService();
