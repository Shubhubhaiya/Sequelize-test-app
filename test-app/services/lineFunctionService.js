const { LineFunction } = require('../database/models');
const BaseService = require('./baseService');

class LineFunctionService extends BaseService {
  constructor() {
    super(LineFunction);
  }
}

module.exports = new LineFunctionService();
