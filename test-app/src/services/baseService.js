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

  async findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
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
}

module.exports = BaseService;
