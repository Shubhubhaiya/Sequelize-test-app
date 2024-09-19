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
const sequelizeErrorHandler = require('../utils/sequelizeErrorHandler');

class TherapeuticAreaService extends baseService {
  constructor() {
    super(TherapeuticArea);
  }

  async getAllTherapeuticAreas(query) {
    try {
      const userId = query.userId;
      if (!userId) {
        return apiResponse.badRequest({ message: 'Please provide userId' });
      }
      const user = await User.findByPk(userId);
      if (!user) {
        return apiResponse.dataNotFound({ message: 'User not found.' });
      }

      const customOptions = {};

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

      const { data, pagination } = await this.findAndCountAll(
        query,
        customOptions
      );

      if (data.length === 0) {
        return apiResponse.success();
      }

      return apiResponse.success(data, pagination);
    } catch (error) {
      return sequelizeErrorHandler.handle(error);
    }
  }

  async assignTherapeuticAreas(adminUserId, dealLeadId, therapeuticAreaIds) {
    const transaction = await sequelize.transaction();

    try {
      // Fetch the admin user and validate their role
      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser || adminUser.roleId !== roles.SYSTEM_ADMIN) {
        return apiResponse.unauthorized(
          'Only SystemAdmins can assign TherapeuticAreas.'
        );
      }

      // Fetch the deal lead user and validate their role
      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser || dealLeadUser.roleId !== roles.DEAL_LEAD) {
        return apiResponse.badRequest({
          message: 'TherapeuticArea can only be assigned to Deal Leads.'
        });
      }

      // Loop through the therapeutic area IDs and handle the assignments
      for (const therapeuticAreaId of therapeuticAreaIds) {
        const therapeuticArea = await TherapeuticArea.findByPk(
          therapeuticAreaId,
          { transaction }
        );

        if (!therapeuticArea) {
          await transaction.rollback();
          return apiResponse.dataNotFound({
            message: `TherapeuticArea with ID ${therapeuticAreaId} not found.`
          });
        }

        try {
          await UserTherapeuticAreas.create(
            { userId: dealLeadId, therapeuticAreaId },
            { transaction }
          );
        } catch (error) {
          if (error instanceof Sequelize.UniqueConstraintError) {
            // Handle the composite key violation by including the therapeutic area name in the error
            return apiResponse.conflict({
              message: `Deal lead is already associated with the therapeutic area "${therapeuticArea.name}".`
            });
          }
          throw error;
        }
      }

      // Commit the transaction after all operations are successful
      await transaction.commit();

      return apiResponse.success({
        message: 'Therapeutic Areas assigned successfully.'
      });
    } catch (error) {
      await transaction.rollback();
      return sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new TherapeuticAreaService();
