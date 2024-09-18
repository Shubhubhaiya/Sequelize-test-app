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

class DealService extends baseService {
  constructor() {
    super(Deal);
  }

  async createDeal(data) {
    const transaction = await sequelize.transaction();

    try {
      const { name, stage, therapeuticArea, userId, dealLead } = data;

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

      SYSTEM_ADMIN.defejfejfb;
      if (!userResponse) {
        return apiResponse.badRequest({ message: 'Invalid User ID' });
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
            createdBy: userId,
            modifiedBy: userId
          },
          { transaction }
        );

        await transaction.commit();
        return apiResponse.success(newDeal);
      }
    } catch (error) {
      await transaction.rollback();

      // Handle UniqueConstraintError for the deal name
      if (error instanceof Sequelize.UniqueConstraintError) {
        return apiResponse.badRequest({
          message: 'This deal name is already in use.'
        });
      }
      return sequelizeErrorHandler.handle(error);
    }
  }
}

module.exports = new DealService();
