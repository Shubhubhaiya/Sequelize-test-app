const {
  Deal,
  Stage,
  TherapeuticArea,
  User,
  DealLeadMapping,
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

      // Validate that stage, therapeuticArea, and userId exist
      const [stageResponse, therapeuticAreaResponse, userResponse] =
        await Promise.all([
          Stage.findByPk(stage, { transaction }),
          TherapeuticArea.findByPk(therapeuticArea, { transaction }),
          User.findByPk(userId, { transaction })
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

      // by default the dealLead who created the deal is deal lead of that deal
      if (userResponse.roleId == roles.DEAL_LEAD) {
        dealLead = userResponse.id;
      }

      // If dealLead is provided, validate that the dealLead is associated with the given Therapeutic Area
      if (dealLead) {
        const dealLeadUser = await User.findByPk(dealLead, {
          include: {
            model: TherapeuticArea,
            as: 'therapeuticAreas',
            where: { id: therapeuticArea }
          },
          transaction
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

        // Add entry to DealLeadMapping table
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
        // Create the deal without dealLead
        const newDeal = await Deal.create(
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

  async updateDeal(id, data) {
    const transaction = await sequelize.transaction();

    try {
      const { name, stage, therapeuticArea, userId, dealLead } = data;

      // Fetch the user to check their role
      const userResponse = await User.findByPk(userId, { transaction });

      if (!userResponse) {
        await transaction.rollback();
        return apiResponse.badRequest({ message: 'Invalid User ID' });
      }

      // Fetch the deal to update
      const deal = await Deal.findByPk(id, { transaction });
      if (!deal) {
        await transaction.rollback();
        return apiResponse.dataNotFound({ message: 'Deal not found.' });
      }

      // If user is a Deal Lead, ensure they are the creator of the deal
      if (
        userResponse.roleId === roles.DEAL_LEAD &&
        deal.createdBy !== userId
      ) {
        await transaction.rollback();
        return apiResponse.forbidden({
          message: 'You are not authorized to update this deal.'
        });
      }

      // Check if another deal with the same name exists (but not the current deal)
      const existingDeal = await Deal.findOne({
        where: {
          name,
          id: { [Sequelize.Op.ne]: id }
        },
        transaction
      });

      if (existingDeal) {
        await transaction.rollback();
        return apiResponse.conflict({
          message: 'This Deal name already exists.'
        });
      }

      // Validate that stage and therapeuticArea exist
      const [stageResponse, therapeuticAreaResponse] = await Promise.all([
        Stage.findByPk(stage, { transaction }),
        TherapeuticArea.findByPk(therapeuticArea, { transaction })
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
          where: { id },
          transaction
        }
      );

      // Fetch the current deal lead (if any) from the DealLeadMapping table
      const currentDealLeadMapping = await DealLeadMapping.findOne({
        where: { dealId: id, isDeleted: false },
        transaction
      });

      if (dealLead) {
        // If a deal lead is provided, check if it is different from the current deal lead
        if (
          currentDealLeadMapping &&
          currentDealLeadMapping.userId !== dealLead
        ) {
          // Mark old deal lead mapping as deleted
          await DealLeadMapping.update(
            { isDeleted: true },
            { where: { dealId: id }, transaction }
          );

          // Check if the new deal lead was previously assigned but marked as deleted
          const existingDeletedMapping = await DealLeadMapping.findOne({
            where: {
              dealId: id,
              userId: dealLead,
              isDeleted: true
            },
            transaction
          });

          if (existingDeletedMapping) {
            // If a deleted mapping exists, just update the `isDeleted` flag to false
            await DealLeadMapping.update(
              { isDeleted: false },
              { where: { dealId: id, userId: dealLead }, transaction }
            );
          } else {
            // Validate that the new deal lead is associated with the given Therapeutic Area
            const dealLeadUser = await User.findByPk(dealLead, {
              include: {
                model: TherapeuticArea,
                as: 'therapeuticAreas',
                where: { id: therapeuticArea }
              },
              transaction
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
                dealId: id,
                isDeleted: false
              },
              { transaction }
            );
          }
        } else if (!currentDealLeadMapping) {
          // No deal lead was previously set, so create a new mapping
          await DealLeadMapping.create(
            {
              userId: dealLead,
              dealId: id,
              isDeleted: false
            },
            { transaction }
          );
        }
      } else if (currentDealLeadMapping) {
        // If no dealLead is provided and there is an existing mapping, mark it as isDeleted: true
        await DealLeadMapping.update(
          { isDeleted: true },
          { where: { dealId: id }, transaction }
        );
      }

      await transaction.commit();
      return apiResponse.success({ message: 'Deal updated successfully' });
    } catch (error) {
      await transaction.rollback();
      return sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new DealService();
