const { LineFunction } = require('../database/models');
const BaseService = require('./baseService');
const ResponseCodes = require('../utils/responseCode');

class LineFunctionService extends BaseService {
  constructor() {
    super(LineFunction);
  }

  async getAllLineFunctions(query) {
    const response = new ResponseCodes();
    let { page = 1, limit = 10 } = query;

    limit = parseInt(limit);
    page = parseInt(page);

    // fetch all records if limit is 0
    if (!limit) {
      limit = null;
      page = 1; // Set page to 1 for consistency
    }

    const offset = limit ? (page - 1) * limit : undefined;

    // Fetch data and count
    const { count, rows } = await this.model.findAndCountAll({
      limit: limit || undefined,
      offset: offset || undefined
    });

    // Handle case where no records are found
    if (count === 0) {
      return response.dataNotFound('No line functions found.');
    }

    // Calculate total pages, set to 1 if fetching all records
    const totalPages = limit ? Math.ceil(count / limit) : 1;

    // Construct the pagination object
    const pagination = {
      totalRecords: count,
      currentPage: page,
      totalPages: totalPages,
      pageSize: limit || count
    };

    // Construct the response
    return response.success(rows, pagination);
  }
}

module.exports = new LineFunctionService();
