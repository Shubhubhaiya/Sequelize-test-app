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

      // Check if another deal with the same name exists (but not the current deal)
      const existingDeal = await Deal.findOne({
        where: {
          name,
          id: { [Sequelize.Op.ne]: id } // Ensure that we are looking for other deals with the same name
        },
        transaction
      });

      if (existingDeal) {
        await transaction.rollback();
        return apiResponse.badRequest({ message: 'Deal name already exists.' });
      }

      // Proceed to update the deal
      await Deal.update(
        {
          name,
          currentStage: stage,
          therapeuticArea,
          modifiedBy: userId
        },
        {
          where: { id }, // Update the deal with the matching `id`
          transaction
        }
      );

      // Check if `dealLead` is provided in the request body
      if (dealLead) {
        // Either update or insert into DealLeadMapping table
        await DealLeadMapping.upsert(
          {
            dealId: id,
            userId: dealLead,
            isDeleted: false
          },
          {
            where: { dealId: id, userId: dealLead },
            transaction
          }
        );
      } else {
        // If no `dealLead` provided, mark existing mappings as `isDeleted: true`
        await DealLeadMapping.update(
          {
            isDeleted: true
          },
          {
            where: { dealId: id },
            transaction
          }
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
