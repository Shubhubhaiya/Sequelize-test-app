class PaginationHelper {
  /**
   * Creates a pagination object containing metadata for the paginated query.
   *
   * @param {number} count - The total number of records.
   * @param {number} page - The current page number.
   * @param {number} limit - The number of items per page.
   * @returns {Object} - An object containing pagination metadata.
   */
  static createPaginationObject(count, page, limit) {
    return {
      totalRecords: count,
      currentPage: page,
      totalPages: limit ? Math.ceil(count / limit) : 1,
      pageSize: limit || count
    };
  }

  /**
   * Executes a paginated query using a Sequelize model and returns the data with pagination metadata.
   *
   * @param {Object} model - The Sequelize model to query.
   * @param {Object} query - The query parameters containing pagination info (use validated and parsed params from middleware).
   * @param {Object} [customOptions={}] - Additional options for the Sequelize query.
   * @returns {Object} - An object containing the fetched data and pagination metadata.
   */
  static async findAndCountAllWithPagination(model, query, customOptions = {}) {
    const { page, limit } = query;
    const offset = limit ? (page - 1) * limit : undefined;

    const options = {
      limit: limit || undefined, // Set limit if defined, otherwise undefined (fetch all)
      offset: offset || undefined,
      ...customOptions
    };

    // Execute the query using Sequelize's findAndCountAll method
    const { count, rows } = await model.findAndCountAll(options);

    // Create pagination metadata
    const pagination = this.createPaginationObject(count, page, limit);

    return { data: rows, pagination };
  }
}

module.exports = PaginationHelper;
