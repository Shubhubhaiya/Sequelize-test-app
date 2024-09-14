const {
  TherapeuticArea,
  User,
  UserTherapeuticAreas,
  sequelize
} = require('../database/models');

const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const roles = require('../config/roles');

class TherapeuticAreaService extends baseService {
  constructor() {
    super(TherapeuticArea);
  }

  async getAllTherapeuticAreas(query) {
    let { page = 1, limit = 10, userId = null } = query;

    limit = parseInt(limit);
    page = parseInt(page);

    // Fetch all records if limit is 0
    if (!limit) {
      limit = null;
      page = 1; // Set page to 1 for consistency
    }

    const offset = limit ? (page - 1) * limit : undefined;

    // Build the query options
    const queryOptions = {
      limit: limit || undefined,
      offset: offset || undefined
    };

    // If userId is provided, filter by userId
    if (userId) {
      queryOptions.include = [
        {
          model: User,
          as: 'users', // Alias must match the alias in the association
          where: { id: userId },
          attributes: [], // Exclude all attributes from the User model
          through: { attributes: [] } // Exclude attributes from the join table
        }
      ];
    }

    try {
      // Fetch data and count
      const { count, rows } = await this.model.findAndCountAll(queryOptions);

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
    } catch (error) {
      return apiResponse.serverError({ message: error.message });
    }
  }

  async assignTherapeuticAreas(adminUserId, dealLeadId, therapeuticAreaIds) {
    // Start a new transaction
    const transaction = await sequelize.transaction();

    try {
      // Validate input
      if (
        !adminUserId ||
        !dealLeadId ||
        !Array.isArray(therapeuticAreaIds) ||
        therapeuticAreaIds.length === 0
      ) {
        return apiResponse.badRequest(
          'All fields are required and therapeuticAreaIds should be a non-empty array.'
        );
      }

      // Check if the user is a SystemAdmin
      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser || adminUser.roleId !== roles.SYSTEM_ADMIN) {
        return apiResponse.unauthorized(
          'Only SystemAdmins can assign TherapeuticAreas.'
        );
      }

      // Check if the user to be assigned is a DealLead
      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser || dealLeadUser.roleId !== roles.DEAL_LEAD) {
        return apiResponse.badRequest(
          'TherapeuticArea can only be assigned to Deal Leads.'
        );
      }

      // Validate and assign each TherapeuticArea within the transaction
      const assignedAreas = [];
      for (const therapeuticAreaId of therapeuticAreaIds) {
        const therapeuticArea = await TherapeuticArea.findByPk(
          therapeuticAreaId,
          { transaction }
        );
        if (!therapeuticArea) {
          await transaction.rollback();
          return apiResponse.dataNotFound(
            `TherapeuticArea with ID ${therapeuticAreaId} not found.`
          );
        }

        // Assign the TherapeuticArea to the DealLead
        await UserTherapeuticAreas.create(
          {
            userId: dealLeadId,
            therapeuticAreaId: therapeuticAreaId
          },
          { transaction }
        );

        assignedAreas.push(therapeuticArea.name);
      }

      // Commit the transaction if all operations were successful
      await transaction.commit();

      return apiResponse.success(
        `TherapeuticAreas ${assignedAreas.join(', ')} assigned to DealLead ${dealLeadUser.firstName} ${dealLeadUser.lastName} successfully.`
      );
    } catch (error) {
      // Rollback the transaction in case of any error
      await transaction.rollback();
      return apiResponse.serverError({ message: error.message });
    }
  }
}

module.exports = new TherapeuticAreaService();
