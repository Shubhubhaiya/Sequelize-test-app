const { Stage } = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');

class StageService extends baseService {
  constructor() {
    super(Stage);
  }

  async getAllStages(query) {
    let { page = 1, limit = 10 } = query;

    limit = parseInt(limit);
    page = parseInt(page);

    // Fetch all records if limit is 0
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
      return apiResponse.dataNotFound();
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

    // Construct the success apiResponse
    return apiResponse.success(rows, pagination);
  }
}

module.exports = new StageService();
