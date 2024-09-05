const { Stage } = require('../database/models');
const BaseService = require('./baseService');

class StageService extends BaseService {
  constructor() {
    super(Stage);
  }
}

module.exports = new StageService();
