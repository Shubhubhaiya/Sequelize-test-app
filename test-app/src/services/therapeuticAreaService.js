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
      // Fetch the admin user and validate their role
      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser) {
        const error = new Error('Admin user not found.');
        error.statusCode = statusCodes.NOT_FOUND;
        throw error;
      }
      if (adminUser.roleId !== roles.SYSTEM_ADMIN) {
        const error = new Error(
          'Only SystemAdmins can assign TherapeuticAreas.'
        );
        error.statusCode = statusCodes.UNAUTHORIZED;
        throw error;
      }

      // Fetch the deal lead user and validate their role
      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser) {
        const error = new Error('Deal lead user not found.');
        error.statusCode = statusCodes.NOT_FOUND;
        throw error;
      }
      if (dealLeadUser.roleId !== roles.DEAL_LEAD) {
        const error = new Error(
          'TherapeuticAreas can only be assigned to Deal Leads.'
        );
        error.statusCode = statusCodes.BAD_REQUEST;
        throw error;
      }

      // Fetch all therapeutic areas in one query
      const therapeuticAreas = await TherapeuticArea.findAll({
        where: { id: therapeuticAreaIds }
      });

      // Check if any therapeutic areas were not found
      const foundIds = therapeuticAreas.map((ta) => ta.id);
      const notFoundIds = therapeuticAreaIds.filter(
        (id) => !foundIds.includes(id)
      );

      if (notFoundIds.length > 0) {
        const error = new Error(
          `TherapeuticArea(s) with ID(s) ${notFoundIds.join(', ')} not found.`
        );
        error.statusCode = statusCodes.NOT_FOUND;
        throw error;
      }

      // Start the transaction
      transaction = await sequelize.transaction();

      // Assign therapeutic areas
      for (const therapeuticArea of therapeuticAreas) {
        await UserTherapeuticAreas.create(
          { userId: dealLeadId, therapeuticAreaId: therapeuticArea.id },
          { transaction }
        );
      }

      // Commit the transaction
      await transaction.commit();

      // Return success message
      return { message: 'Therapeutic Areas assigned successfully.' };
    } catch (error) {
      // Rollback the transaction if it exists
      if (transaction) {
        await transaction.rollback();
      }

      // Handle UniqueConstraintError to include therapeutic area name
      if (error instanceof Sequelize.UniqueConstraintError) {
        const fieldValues = error.fields;
        const therapeuticAreaId = fieldValues.therapeuticAreaId;
        const therapeuticArea = therapeuticAreas.find(
          (ta) => ta.id === Number(therapeuticAreaId)
        );
        const uniqueError = new Error(
          `Deal lead is already associated with the therapeutic area ${therapeuticArea.name}.`
        );
        uniqueError.statusCode = statusCodes.CONFLICT;
        throw uniqueError;
      }

      // Use the error handler to process Sequelize errors
      if (!error.statusCode) {
        sequelizeErrorHandler.handle(error);
      }

      throw error;
    }
  }
}

module.exports = new TherapeuticAreaService();
