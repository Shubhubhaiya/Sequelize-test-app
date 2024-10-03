const { Stage } = require('../database/models');
const baseService = require('./baseService');
const errorHandler = require('../utils/errorHandler');

class StageService extends baseService {
  constructor() {
    super(Stage);
  }

  async getAllStages(query) {
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

module.exports = new StageService();
