const {
  TherapeuticArea,
  User,
  UserTherapeuticAreas,
  sequelize,
  Sequelize
} = require('../database/models');

const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const roles = require('../config/roles');
const statusCodes = require('../config/statusCodes');
const CustomError = require('../utils/customError');
const responseMessages = require('../config/responseMessages');
const errorHandler = require('../utils/errorHandler');

class TherapeuticAreaService extends baseService {
  constructor() {
    super(TherapeuticArea);
  }

  async getAllTherapeuticAreas(query) {
    try {
      const userId = query.userId;

      // Validate userId
      if (!userId) {
        throw new CustomError('Please provide userId', statusCodes.BAD_REQUEST);
      }

      // Fetch the user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new CustomError('User not found.', statusCodes.NOT_FOUND);
      }

      const customOptions = {
        attributes: ['id', 'name']
      };

      // If the user is a DealLead, filter by userId
      if (user.roleId === roles.DEAL_LEAD) {
        customOptions.include = [
          {
            model: User,
            as: 'users',
            where: { id: user.id },
            attributes: [],
            through: { attributes: [] },
            required: true
          }
        ];
      }

      // Fetch data using findAndCountAll
      const { data, pagination } = await this.findAndCountAll(
        query,
        customOptions
      );

      return { data, pagination };
    } catch (error) {
      errorHandler.handle(error);
    }
  }

  async assignTherapeuticAreas(adminUserId, dealLeadId, therapeuticAreaIds) {
    let transaction;
    try {
      // Check if admin exists
      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser) {
        throw new CustomError('Admin not found.', statusCodes.NOT_FOUND);
      }

      // check the role of admin
      if (adminUser.roleId !== roles.SYSTEM_ADMIN) {
        throw new CustomError(
          'Only System Admin can assign TherapeuticAreas.',
          statusCodes.UNAUTHORIZED
        );
      }

      // check if deal lead exists
      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser) {
        throw new CustomError('Deal lead not found.', statusCodes.NOT_FOUND);
      }

      // check the role of deal lead
      if (dealLeadUser.roleId !== roles.DEAL_LEAD) {
        throw new CustomError(
          'TherapeuticAreas can only be assigned to Deal Leads.',
          statusCodes.BAD_REQUEST
        );
      }

      // Fetch all therapeutic areas
      const therapeuticAreasResponse = await TherapeuticArea.findAll({
        where: { id: therapeuticAreaIds }
      });

      // Check if any therapeutic areas were not found
      const foundIds = therapeuticAreasResponse.map((ta) => ta.id);
      const notFoundIds = therapeuticAreaIds.filter(
        (id) => !foundIds.includes(id)
      );

      if (notFoundIds.length > 0) {
        throw new CustomError(
          `TherapeuticArea(s) with ID(s) ${notFoundIds.join(', ')} not found.`,
          statusCodes.NOT_FOUND
        );
      }

      // Fetch existing mappings to avoid duplicate assignments
      const existingMappings = await UserTherapeuticAreas.findAll({
        where: {
          userId: dealLeadId,
          therapeuticAreaId: foundIds
        }
      });
      const existingIds = existingMappings.map(
        (mapping) => mapping.therapeuticAreaId
      );
      const newTherapeuticAreaIds = foundIds.filter(
        (id) => !existingIds.includes(id)
      );

      if (newTherapeuticAreaIds.length === 0) {
        return {
          message: 'All specified therapeutic areas are already assigned.'
        };
      }

      // Start the transaction
      transaction = await sequelize.transaction();

      // Assign new therapeutic areas
      for (const therapeuticAreaId of newTherapeuticAreaIds) {
        await UserTherapeuticAreas.create(
          { userId: dealLeadId, therapeuticAreaId },
          { transaction }
        );
      }

      // Commit the transaction
      await transaction.commit();

      return { message: 'Therapeutic Areas assigned successfully.' };
    } catch (error) {
      // Rollback the transaction if it exists
      if (transaction) {
        await transaction.rollback();
      }

      // Handle errors using the custom error handler
      errorHandler.handle(error);
    }
  }
}

module.exports = new TherapeuticAreaService();
