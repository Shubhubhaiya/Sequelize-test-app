const {
  Deal,
  Stage,
  TherapeuticArea,
  User,
  DealLeadMapping,
  DealWiseResourceInfo,
  sequelize,
  Sequelize
} = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const sequelizeErrorHandler = require('../utils/sequelizeErrorHandler');
const roles = require('../config/roles');

class DealService extends baseService {
  constructor() {
    super(Deal);
  }

  async createDeal(data) {
    const transaction = await sequelize.transaction();

    try {
      const { name, stage, therapeuticArea, userId } = data;
      let { dealLead } = data;

      // Check for duplicate deal name
      const existingDeal = await Deal.findOne({ where: { name } });
      if (existingDeal) {
        return apiResponse.conflict({
          message: 'This deal name is already in use.'
        });
      }

      // Validate stage, therapeuticArea, and user existence
      const [stageResponse, therapeuticAreaResponse, userResponse] =
        await Promise.all([
          Stage.findByPk(stage),
          TherapeuticArea.findByPk(therapeuticArea),
          User.findByPk(userId)
        ]);

      if (!stageResponse) {
        return apiResponse.badRequest({ message: 'Invalid Stage ID' });
      }

      if (!therapeuticAreaResponse) {
        return apiResponse.badRequest({
          message: 'Invalid Therapeutic Area ID'
        });
      }

      if (!userResponse) {
        return apiResponse.badRequest({ message: 'Invalid User ID' });
      }

      // Assign default deal lead to the user who created the deal
      if (userResponse.roleId === roles.DEAL_LEAD) {
        dealLead = userResponse.id;
      }

      // Validate the deal lead (if provided) belongs to the therapeutic area
      if (dealLead) {
        const dealLeadUser = await User.findByPk(dealLead, {
          include: {
            model: TherapeuticArea,
            as: 'therapeuticAreas',
            where: { id: therapeuticArea }
          }
        });

        if (!dealLeadUser) {
          await transaction.rollback();
          return apiResponse.badRequest({
            message:
              'Deal Lead is not associated with the provided Therapeutic Area.'
          });
        }

        // Create the deal
        const newDeal = await Deal.create(
          {
            name,
            currentStage: stage,
            therapeuticArea,
            createdBy: userId
          },
          { transaction }
        );

        // Add the deal lead mapping
        await DealLeadMapping.create(
          {
            userId: dealLead,
            dealId: newDeal.id
          },
          { transaction }
        );

        await transaction.commit();
        return apiResponse.success({ message: 'Deal created successfully' });
      } else {
        // Create the deal without a deal lead
        await Deal.create(
          {
            name,
            currentStage: stage,
            therapeuticArea,
            createdBy: userId
          },
          { transaction }
        );

        await transaction.commit();
        return apiResponse.success({ message: 'Deal created successfully' });
      }
    } catch (error) {
      await transaction.rollback();
      return sequelizeErrorHandler.handle(error);
    }
  }

  async updateDeal(dealId, data) {
    const transaction = await sequelize.transaction();

    try {
      const { name, stage, therapeuticArea, userId } = data;
      let { dealLead } = data;

      // Fetch the user to check their role
      const userResponse = await User.findByPk(userId);
      if (!userResponse) {
        await transaction.rollback();
        return apiResponse.badRequest({ message: 'Invalid User ID' });
      }

      // Fetch the deal to update
      const deal = await Deal.findByPk(dealId);
      if (!deal) {
        await transaction.rollback();
        return apiResponse.dataNotFound({ message: 'Deal not found.' });
      }

      // Ensure deal leads can only update their own deals
      if (
        userResponse.roleId === roles.DEAL_LEAD &&
        deal.createdBy !== userId
      ) {
        await transaction.rollback();
        return apiResponse.forbidden({
          message: 'You are not authorized to update this deal.'
        });
      }

      if (userResponse.roleId === roles.DEAL_LEAD) {
        dealLead = userResponse.id;
      }

      // Check if another deal with the same name exists (but not the current deal)
      const isDealWithSameNameExist = await Deal.findOne({
        where: {
          name,
          id: { [Sequelize.Op.ne]: dealId }
        }
      });

      if (isDealWithSameNameExist) {
        await transaction.rollback();
        return apiResponse.conflict({
          message: 'This deal name already exists.'
        });
      }

      // Validate that stage and therapeuticArea exist
      const [stageResponse, therapeuticAreaResponse] = await Promise.all([
        Stage.findByPk(stage),
        TherapeuticArea.findByPk(therapeuticArea)
      ]);

      if (!stageResponse) {
        await transaction.rollback();
        return apiResponse.badRequest({ message: 'Invalid Stage ID' });
      }

      if (!therapeuticAreaResponse) {
        await transaction.rollback();
        return apiResponse.badRequest({
          message: 'Invalid Therapeutic Area ID'
        });
      }

      // Update the deal
      await Deal.update(
        {
          name,
          currentStage: stage,
          therapeuticArea,
          modifiedBy: userId
        },
        {
          where: { id: dealId },
          transaction
        }
      );

      // Deal lead mapping logic
      const currentDealLeadMapping = await DealLeadMapping.findOne({
        where: { dealId, isDeleted: false }
      });

      if (dealLead) {
        // Check if the deal lead is different
        if (
          currentDealLeadMapping &&
          currentDealLeadMapping.userId !== dealLead
        ) {
          // Mark old deal lead mapping as deleted
          await DealLeadMapping.update(
            { isDeleted: true },
            { where: { dealId }, transaction }
          );

          // Check if the new deal lead was previously assigned
          const existingDeletedMapping = await DealLeadMapping.findOne({
            where: {
              dealId,
              userId: dealLead,
              isDeleted: true
            }
          });

          if (existingDeletedMapping) {
            // Update the existing mapping
            await DealLeadMapping.update(
              { isDeleted: false },
              { where: { dealId, userId: dealLead }, transaction }
            );
          } else {
            // Validate that the new deal lead is associated with the given therapeutic area
            const dealLeadUser = await User.findByPk(dealLead, {
              include: {
                model: TherapeuticArea,
                as: 'therapeuticAreas',
                where: { id: therapeuticArea }
              }
            });

            if (!dealLeadUser) {
              await transaction.rollback();
              return apiResponse.badRequest({
                message:
                  'Deal Lead is not associated with the provided Therapeutic Area.'
              });
            }

            // Create a new deal lead mapping
            await DealLeadMapping.create(
              {
                userId: dealLead,
                dealId,
                isDeleted: false
              },
              { transaction }
            );
          }
        } else if (!currentDealLeadMapping) {
          // No deal lead previously set, create a new mapping
          await DealLeadMapping.create(
            {
              userId: dealLead,
              dealId,
              isDeleted: false
            },
            { transaction }
          );
        }
      } else if (currentDealLeadMapping) {
        // If no dealLead is provided, mark the current deal lead mapping as deleted
        await DealLeadMapping.update(
          { isDeleted: true },
          { where: { dealId }, transaction }
        );
      }

      await transaction.commit();
      return apiResponse.success({ message: 'Deal updated successfully' });
    } catch (error) {
      await transaction.rollback();
      return sequelizeErrorHandler.handle(error);
    }
  }

  async deleteDeal(dealId, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Fetch the deal to delete
      const deal = await Deal.findByPk(dealId);

      if (!deal) {
        return apiResponse.dataNotFound({ message: 'Deal not found.' });
      }

      // Check if the deal is already deleted
      if (deal.isDeleted) {
        return apiResponse.badRequest({
          message: 'This Deal is already deleted.'
        });
      }

      // Fetch the user to check their role
      const user = await User.findByPk(userId);

      if (!user) {
        await transaction.rollback();
        return apiResponse.badRequest({ message: 'Invalid User ID' });
      }

      // Ensure deal leads can only delete their own deals
      if (user.roleId === roles.DEAL_LEAD && deal.createdBy !== userId) {
        return apiResponse.forbidden({
          message: 'You are not authorized to delete this deal.'
        });
      }

      // Soft delete the deal by setting the isDeleted flag to true
      await deal.update(
        { isDeleted: true, modifiedBy: userId },
        { transaction }
      );

      // Soft delete associated DealLeadMapping records
      await DealLeadMapping.update(
        { isDeleted: true },
        { where: { dealId }, transaction }
      );

      // Soft delete associated DealWiseResourceInfo records
      await DealWiseResourceInfo.update(
        { isDeleted: true },
        { where: { dealId }, transaction }
      );

      // Commit the transaction after all operations are successful
      await transaction.commit();
      return apiResponse.success({ message: 'Deal deleted successfully.' });
    } catch (error) {
      await transaction.rollback();
      return sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new DealService();
