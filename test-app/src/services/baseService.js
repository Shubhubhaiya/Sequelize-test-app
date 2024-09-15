const paginationHelper = require('../utils/paginationHelper');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id) {
    return this.model.findByPk(id);
  }

  async update(id, data) {
    const record = await this.model.findByPk(id);
    if (!record) throw new Error('Record not found');
    return record.update(data);
  }

  async delete(id) {
    const record = await this.model.findByPk(id);
    if (!record) throw new Error('Record not found');
    return record.destroy();
  }

  async findAndCountAll(query, customOptions = {}) {
    return paginationHelper.findAndCountAllWithPagination(
      this.model,
      query,
      customOptions
    );
  }
}

module.exports = BaseService;
