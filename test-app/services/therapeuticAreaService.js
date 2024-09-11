const { TherapeuticArea } = require('../database/models');
const BaseService = require('./baseService');

class TherapeuticAreaService extends BaseService {
  constructor() {
    super(TherapeuticArea);
  }
}

module.exports = new TherapeuticAreaService();
