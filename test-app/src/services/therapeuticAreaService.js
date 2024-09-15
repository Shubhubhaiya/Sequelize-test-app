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
    try {
      const user = await User.findByPk(query.userId);
      if (!user) {
        return apiResponse.dataNotFound('User not found.');
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
        return apiResponse.dataNotFound();
      }

      return apiResponse.success(data, pagination);
    } catch (error) {
      return apiResponse.serverError({ message: error.message });
    }
  }

  async assignTherapeuticAreas(adminUserId, dealLeadId, therapeuticAreaIds) {
    const transaction = await sequelize.transaction();

    try {
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

      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser || adminUser.roleId !== roles.SYSTEM_ADMIN) {
        return apiResponse.unauthorized(
          'Only SystemAdmins can assign TherapeuticAreas.'
        );
      }

      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser || dealLeadUser.roleId !== roles.DEAL_LEAD) {
        return apiResponse.badRequest(
          'TherapeuticArea can only be assigned to Deal Leads.'
        );
      }

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

        await UserTherapeuticAreas.create(
          { userId: dealLeadId, therapeuticAreaId },
          { transaction }
        );

        assignedAreas.push(therapeuticArea.name);
      }

      await transaction.commit();

      return apiResponse.success();
    } catch (error) {
      await transaction.rollback();
      return apiResponse.serverError({ message: error.message });
    }
  }
}

module.exports = new TherapeuticAreaService();
