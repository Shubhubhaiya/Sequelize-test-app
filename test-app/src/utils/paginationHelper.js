class PaginationHelper {
  static parsePaginationParams({ page = 1, limit = 10 }) {
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    if (limit === 0) {
      limit = null;
      page = 1;
    }

    return { page, limit };
  }

  static createPaginationObject(count, page, limit) {
    return {
      totalRecords: count,
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1,
      pageSize: limit || count
    };
  }

  static async findAndCountAllWithPagination(model, query, customOptions = {}) {
    const { page, limit } = this.parsePaginationParams(query);
    const offset = limit ? (page - 1) * limit : undefined;

    const options = {
      limit: limit || undefined,
      offset: offset || undefined,
      ...customOptions
    };

    const { count, rows } = await model.findAndCountAll(options);

    const pagination = this.createPaginationObject(count, page, limit);
    return { data: rows, pagination };
  }
}

module.exports = PaginationHelper;
