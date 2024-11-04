const {
  TherapeuticArea,
  User,
  Deal,
  UserTherapeuticAreas,
  sequelize,
  Sequelize
} = require('../database/models');

const baseService = require('./baseService');
const roles = require('../config/roles');
const statusCodes = require('../config/statusCodes');
const CustomError = require('../utils/customError');
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

  async assignOrUnassignTherapeuticAreas(
    adminUserId,
    dealLeadId,
    assignTA = [],
    unassignTA = []
  ) {
    let transaction;
    try {
      // Start the transaction
      transaction = await sequelize.transaction();

      // Check if admin exists and has the SYSTEM_ADMIN role
      const adminUser = await User.findByPk(adminUserId);
      if (!adminUser || adminUser.roleId !== roles.SYSTEM_ADMIN) {
        throw new CustomError(
          'Only System Admin can assign or unassign Therapeutic Areas.',
          statusCodes.UNAUTHORIZED
        );
      }

      // Check if the deal lead exists
      const dealLeadUser = await User.findByPk(dealLeadId);
      if (!dealLeadUser) {
        throw new CustomError('Deal lead not found.', statusCodes.NOT_FOUND);
      }

      // Check if the user is actually a deal lead
      if (dealLeadUser.roleId !== roles.DEAL_LEAD) {
        throw new CustomError(
          'Therapeutic Areas can only be assigned or unassigned for Deal Leads.',
          statusCodes.BAD_REQUEST
        );
      }

      // Handle therapeutic areas to assign
      if (assignTA.length > 0) {
        const therapeuticAreasResponse = await TherapeuticArea.findAll({
          where: { id: assignTA }
        });

        const foundIds = therapeuticAreasResponse.map((ta) => ta.id);
        const notFoundIds = assignTA.filter((id) => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
          throw new CustomError(
            `TherapeuticArea(s) with ID(s) ${notFoundIds.join(', ')} not found.`,
            statusCodes.NOT_FOUND
          );
        }

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

        // Assign new therapeutic areas
        for (const therapeuticAreaId of newTherapeuticAreaIds) {
          await UserTherapeuticAreas.create(
            { userId: dealLeadId, therapeuticAreaId },
            { transaction }
          );
        }
      }

      // Handle therapeutic areas to unassign
      if (unassignTA.length > 0) {
        // Check if there are any active deals under this therapeutic area for the deal lead
        for (const therapeuticAreaId of unassignTA) {
          const therapeuticArea =
            await TherapeuticArea.findByPk(therapeuticAreaId);

          if (!therapeuticArea) {
            throw new CustomError(
              `Therapeutic area with ID ${therapeuticAreaId} not found.`,
              statusCodes.NOT_FOUND
            );
          }

          const activeDeals = await Deal.findAll({
            include: [
              {
                model: User,
                as: 'leadUsers', // Join with User model through DealLeadMapping
                where: { id: dealLeadId }, // Only include the specified deal lead
                through: { where: { isDeleted: false } } // Only active lead mappings
              }
            ],
            where: {
              therapeuticArea: therapeuticAreaId, // Only deals within this therapeutic area
              isDeleted: false // Only active deals
            }
          });

          // If active deals exist, prevent unassignment
          if (activeDeals.length > 0) {
            throw new CustomError(
              `There are active deals for ${therapeuticArea.name}so can not unassign this.`,
              statusCodes.BAD_REQUEST
            );
          }

          // Proceed to unassign the therapeutic area if no active deals
          await UserTherapeuticAreas.destroy({
            where: {
              userId: dealLeadId,
              therapeuticAreaId
            },
            transaction
          });
        }
      }

      // Commit the transaction
      await transaction.commit();

      return { message: 'Therapeutic Areas assigned/unassigned successfully.' };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      errorHandler.handle(error);
      throw error;
    }
  }
}

module.exports = new TherapeuticAreaService();
