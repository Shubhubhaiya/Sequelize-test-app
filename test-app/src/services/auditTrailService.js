const { AuditTrail, User, Sequelize } = require('../database/models');
const baseService = require('./baseService');
const errorHandler = require('../utils/errorHandler');

class AuditTrailService extends baseService {
  constructor() {
    super(AuditTrail);
  }

  async getLogs(query, body) {
    try {
      const { filters, dealId } = body;

      // Build the base `where` and `include` clauses
      const where = {};
      const include = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ];

      // Apply filters
      if (dealId) where.dealId = dealId;
      if (filters) {
        // Filter by action type
        if (filters.action) where.action = filters.action;

        // Filter by performedBy to search in both firstName and lastName (case-insensitive, contains search)
        if (filters.performedBy) {
          include[0].where = {
            [Sequelize.Op.or]: [
              {
                firstName: { [Sequelize.Op.iLike]: `%${filters.performedBy}%` }
              },
              { lastName: { [Sequelize.Op.iLike]: `%${filters.performedBy}%` } }
            ]
          };
        }

        // Filter by actionDate (convert to a timestamp range for the specific day)
        if (filters.actionDate) {
          const startOfDay = new Date(filters.actionDate);
          const endOfDay = new Date(filters.actionDate);
          endOfDay.setUTCHours(23, 59, 59, 999); // End of the day in UTC
          where.actionDate = {
            [Sequelize.Op.between]: [startOfDay, endOfDay]
          };
        }
      }

      // Query with filters, pagination, and sorting
      const { data, pagination } = await this.findAndCountAll(query, {
        where,
        include
      });

      // Format response data
      const result = data.map((entry) => ({
        id: entry.id,
        action: entry.action,
        actionDate: entry.actionDate,
        performedBy: {
          id: entry.user.id,
          name: `${entry.user.lastName}, ${entry.user.firstName}`
        },
        description: entry.description
      }));

      return { result, pagination };
    } catch (error) {
      errorHandler.handle(error);
    }
  }
}

module.exports = new AuditTrailService();
