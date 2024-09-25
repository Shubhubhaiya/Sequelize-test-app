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
const roles = require('../config/roles');
const PaginationHelper = require('../utils/paginationHelper');
const DealDetailResponse = require('../models/response/dealDetailResponse');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');

class DealService extends baseService {
  constructor() {
    super(Deal);
  }

  async createDeal(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const { name, stage, therapeuticArea, userId } = data;
      let { dealLead } = data;

      // Check for duplicate deal name
      const existingDeal = await Deal.findOne({ where: { name } });
      if (existingDeal) {
        throw new CustomError(
          'This deal name is already in use.',
          statusCodes.CONFLICT
        );
      }

      // Validate stage existence
      const stageResponse = await Stage.findByPk(stage);
      if (!stageResponse) {
        throw new CustomError('Stage does not exist.', statusCodes.BAD_REQUEST);
      }

      // Validate therapeuticArea existence
      const therapeuticAreaResponse =
        await TherapeuticArea.findByPk(therapeuticArea);
      if (!therapeuticAreaResponse) {
        throw new CustomError(
          'Therapeutic area does not exist.',
          statusCodes.BAD_REQUEST
        );
      }

      // Validate user existence
      const userResponse = await User.findByPk(userId);
      if (!userResponse) {
        throw new CustomError('User not found.', statusCodes.BAD_REQUEST);
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
          throw new CustomError(
            'Deal Lead is not associated with this Therapeutic Area.',
            statusCodes.BAD_REQUEST
          );
        }
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

      await DealLeadMapping.create(
        {
          userId: dealLead,
          dealId: newDeal.id
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      return apiResponse.success(null, null, 'Deal created successfuly');
    } catch (error) {
      // Rollback the transaction if it exists
      if (transaction) {
        await transaction.rollback();
      }

      errorHandler.handle(error);
    }
  }

  async updateDeal(dealId, data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const { name, stage, therapeuticArea, userId, dealLead } = data;

      let newDealLead = dealLead;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new CustomError('User not found.', statusCodes.BAD_REQUEST);
      }

      const deal = await Deal.findByPk(dealId);
      if (!deal) {
        throw new CustomError('Deal not found.', statusCodes.NOT_FOUND);
      }

      if (user.roleId === roles.DEAL_LEAD && deal.createdBy !== userId) {
        throw new CustomError(
          'Unauthorized to update this deal.',
          statusCodes.FORBIDDEN
        );
      }

      const existingDealWithSameName = await Deal.findOne({
        where: { name, id: { [Sequelize.Op.ne]: dealId } }
      });

      if (existingDealWithSameName) {
        throw new CustomError(
          'Deal name already in use.',
          statusCodes.CONFLICT
        );
      }

      const [isStageExists, isTherapeuticAreaExist] = await Promise.all([
        Stage.findByPk(stage),
        TherapeuticArea.findByPk(therapeuticArea)
      ]);

      if (!isStageExists) {
        throw new CustomError('Stage not found.', statusCodes.BAD_REQUEST);
      }

      if (!isTherapeuticAreaExist) {
        throw new CustomError(
          'Therapeutic Area not found',
          statusCodes.BAD_REQUEST
        );
      }

      await deal.update(
        {
          name,
          currentStage: stage,
          therapeuticArea,
          modifiedBy: userId,
          modifiedAt: new Date()
        },
        { transaction }
      );

      const activeDealLeadMapping = await DealLeadMapping.findOne({
        where: { dealId, isDeleted: false }
      });

      if (
        activeDealLeadMapping &&
        activeDealLeadMapping.userId !== newDealLead
      ) {
        await DealLeadMapping.update(
          { isDeleted: true },
          { where: { dealId }, transaction }
        );

        const inactiveDealLeadMapping = await DealLeadMapping.findOne({
          where: { dealId, userId: newDealLead, isDeleted: true }
        });

        if (inactiveDealLeadMapping) {
          await inactiveDealLeadMapping.update(
            { isDeleted: false },
            { transaction }
          );
        } else {
          await DealLeadMapping.create(
            { userId: newDealLead, dealId },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return apiResponse.success(null, null, 'Deal updated successfully ');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }

  async deleteDeal(dealId, userId) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      // Fetch the deal to delete
      const deal = await Deal.findByPk(dealId);

      if (!deal) {
        throw new CustomError('Deal not found.', statusCodes.BAD_REQUEST);
      }

      // Check if the deal is already deleted
      if (deal.isDeleted) {
        throw new CustomError(
          'This Deal is already deleted.',
          statusCodes.BAD_REQUEST
        );
      }

      // Fetch the user to check their role
      const user = await User.findByPk(userId);

      if (!user) {
        throw new CustomError('Invalid user', statusCodes.BAD_REQUEST);
      }

      // Ensure deal leads can only delete their own deals
      if (user.roleId === roles.DEAL_LEAD && deal.createdBy !== userId) {
        throw new CustomError(
          'You are not authorized to delete this deal.',
          statusCodes.FORBIDDEN
        );
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

      return apiResponse.success(null, null, 'Deal deleted successfully.');
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
      errorHandler.handle(error);
    }
  }

  async getDealDetail(dealId) {
    try {
      // Fetch the deal along with the related models (Stage, TherapeuticArea, and DealLead)
      const deal = await Deal.findOne({
        where: { id: dealId },
        include: [
          {
            model: Stage,
            as: 'stage',
            attributes: ['id', 'name']
          },
          {
            model: TherapeuticArea,
            as: 'therapeuticAreaAssociation',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'leadUsers',
            through: {
              attributes: [],
              where: { isDeleted: false } // Fetch only active (non-deleted) deal leads
            },
            attributes: [
              'email',
              'novartis521ID',
              'firstName',
              'lastName',
              'title'
            ]
          }
        ]
      });

      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // constructing deal response
      const dealDetailResponse = new DealDetailResponse(deal);

      return apiResponse.success(dealDetailResponse);
    } catch (error) {
      errorHandler(error);
    }
  }

  // async getDealsList(query) {
  //   try {
  //     const { filters, page = 1, limit = 10 } = query;
  //     const offset = limit ? (page - 1) * limit : undefined;

  //     // Build filter criteria
  //     const where = { isDeleted: false };
  //     const include = [
  //       {
  //         model: Stage,
  //         as: 'stage',
  //         attributes: ['id', 'name']
  //       },
  //       {
  //         model: TherapeuticArea,
  //         as: 'therapeuticAreaAssociation',
  //         attributes: ['id', 'name']
  //       },
  //       {
  //         model: User,
  //         as: 'leadUsers',
  //         attributes: ['id', 'firstName', 'lastName'],
  //         through: {
  //           attributes: [],
  //           where: { isDeleted: false }
  //         }
  //       }
  //     ];

  //     if (filters) {
  //       // Filter by deal name
  //       if (filters.name) {
  //         where.name = { [Sequelize.Op.iLike]: `%${filters.name}%` };
  //       }

  //       // Filter by therapeutic area
  //       if (filters.therapeuticArea && filters.therapeuticArea.length) {
  //         where.therapeuticArea = {
  //           [Sequelize.Op.in]: filters.therapeuticArea
  //         };
  //       }

  //       // Filter by stage
  //       if (filters.stage && filters.stage.length) {
  //         where.currentStage = { [Sequelize.Op.in]: filters.stage };
  //       }

  //       // Filter by createdBy (firstName or lastName)
  //       if (filters.createdBy) {
  //         include.push({
  //           model: User,
  //           as: 'creator',
  //           attributes: ['id', 'firstName', 'lastName'],
  //           where: {
  //             [Sequelize.Op.or]: [
  //               {
  //                 firstName: { [Sequelize.Op.iLike]: `%${filters.createdBy}%` }
  //               },
  //               { lastName: { [Sequelize.Op.iLike]: `%${filters.createdBy}%` } }
  //             ]
  //           }
  //         });
  //       }

  //       // Filter by modifiedBy (firstName or lastName)
  //       if (filters.modifiedBy) {
  //         include.push({
  //           model: User,
  //           as: 'modifier',
  //           attributes: ['id', 'firstName', 'lastName'],
  //           where: {
  //             [Sequelize.Op.or]: [
  //               {
  //                 firstName: { [Sequelize.Op.iLike]: `%${filters.modifiedBy}%` }
  //               },
  //               {
  //                 lastName: { [Sequelize.Op.iLike]: `%${filters.modifiedBy}%` }
  //               }
  //             ]
  //           }
  //         });
  //       }

  //       // Filter by createdAt date
  //       if (filters.createdAt) {
  //         where.createdAt = { [Sequelize.Op.eq]: new Date(filters.createdAt) };
  //       }

  //       // Filter by modifiedAt date
  //       if (filters.modifiedAt) {
  //         where.modifiedAt = {
  //           [Sequelize.Op.eq]: new Date(filters.modifiedAt)
  //         };
  //       }

  //       // Filter by dealLead name (firstName or lastName)
  //       if (filters.dealLead) {
  //         include.push({
  //           model: User,
  //           as: 'leadUsers',
  //           attributes: ['id', 'firstName', 'lastName'],
  //           through: {
  //             attributes: [],
  //             where: { isDeleted: false }
  //           },
  //           where: {
  //             [Sequelize.Op.or]: [
  //               {
  //                 firstName: { [Sequelize.Op.iLike]: `%${filters.dealLead}%` }
  //               },
  //               { lastName: { [Sequelize.Op.iLike]: `%${filters.dealLead}%` } }
  //             ]
  //           }
  //         });
  //       }
  //     }

  //     // Fetch data and pagination
  //     const { count, rows } = await Deal.findAndCountAll({
  //       where,
  //       include,
  //       limit,
  //       offset
  //     });

  //     // Create response object
  //     const deals = rows.map((deal) => ({
  //       id: deal.id,
  //       name: deal.name,
  //       therapeuticArea: {
  //         id: deal.therapeuticAreaAssociation?.id,
  //         name: deal.therapeuticAreaAssociation?.name
  //       },
  //       stage: {
  //         id: deal.stage?.id,
  //         name: deal.stage?.name
  //       },
  //       createdBy: deal.createdBy,
  //       createdAt: deal.createdAt,
  //       modifiedBy: deal.modifiedBy,
  //       modifiedAt: deal.modifiedAt,
  //       dealLeads: deal.leadUsers.map((leadUser) => ({
  //         id: leadUser.id,
  //         name: `${leadUser.firstName} ${leadUser.lastName}`
  //       }))
  //     }));

  //     const pagination = PaginationHelper.createPaginationObject(
  //       count,
  //       page,
  //       limit
  //     );

  //     return apiResponse.success(deals, pagination);
  //   } catch (error) {
  //     return apiResponse.serverError({ message: error.message });
  //   }
  // }
}

module.exports = new DealService();
