const { Stage } = require('../database/models');

class StageService {
  async getAllStages() {
    const response = await Stage.findAll();
    return response;
  }
}

module.exports = new StageService();
