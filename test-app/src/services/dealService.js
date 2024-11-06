const {
  Deal,
  Stage,
  TherapeuticArea,
  User,
  DealLeadMapping,
  DealWiseResourceInfo,
  ResourceDealMapping,
  DealStageLog,
  sequelize,
  Sequelize
} = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const roles = require('../config/roles');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');
const DealDetailResponseMapper = require('../models/response/dealDetailResponseMapper');

class DealService extends baseService {
  constructor() {
    super(Deal);
  }

  async createDeal(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const { name, stage, therapeuticArea, userId, dealLead } = data;

      // Validate user existence and role
      const userResponse = await User.findByPk(userId);
      if (!userResponse) {
        throw new CustomError('User not found.', statusCodes.BAD_REQUEST);
      }

      // Check if the user is a System Admin
      if (userResponse.roleId !== roles.SYSTEM_ADMIN) {
        throw new CustomError(
          'Only System Admins are authorized to create deals.',
          statusCodes.UNAUTHORIZED
        );
      }

      // Validate deallead existance and role
      const dealLeadResponse = await User.findByPk(dealLead);
      if (!dealLeadResponse) {
        throw new CustomError('Deal lead not found.', statusCodes.BAD_REQUEST);
      }

      if (dealLeadResponse.roleId !== roles.DEAL_LEAD) {
        throw new CustomError(
          'Deal can only assigned to deal lead.',
          statusCodes.BAD_REQUEST
        );
      }

      // Validate the deal lead (if provided) belongs to the therapeutic area
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

      // Check for duplicate deal name
      const existingDeal = await Deal.findOne({
        where: {
          name: { [Sequelize.Op.iLike]: name },
          isDeleted: false
        }
      });
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

      // Create the deal
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

      // Log the stage
      await DealStageLog.create(
        {
          dealId: newDeal.id,
          stageId: stage, // Log the new stage ID
          startDate: new Date() // Start date of the stage
        },
        { transaction }
      );

      // If dealLead is valid, create the mapping

      await DealLeadMapping.create(
        {
          userId: dealLead,
          dealId: newDeal.id,
          createdBy: userId,
          modifiedBy: userId
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      return apiResponse.success(null, null, 'Deal created successfully');
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

      // Destructure request body data
      const { name, stage, therapeuticArea, userId, dealLead } = data;

      // Check if the deal exists
      const deal = await Deal.findByPk(dealId);
      if (!deal) {
        throw new CustomError('Deal not found.', statusCodes.NOT_FOUND);
      }

      // Check if another deal with the same name exists
      const isDealWithSameNameExists = await Deal.findOne({
        where: {
          name: { [Sequelize.Op.iLike]: name },
          id: { [Sequelize.Op.ne]: dealId }, // Exclude the current deal
          isDeleted: false
        }
      });

      if (isDealWithSameNameExists) {
        throw new CustomError(
          'This deal name is already in use.',
          statusCodes.CONFLICT
        );
      }

      // Check if the user (system admin) exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new CustomError('User not found.', statusCodes.BAD_REQUEST);
      }

      // Only system admin can update the deal
      if (user.roleId !== roles.SYSTEM_ADMIN) {
        throw new CustomError(
          'Only system admin can update the deal',
          statusCodes.UNAUTHORIZED
        );
      }

      // Validate deal lead existence and role
      const dealLeadResponse = await User.findByPk(dealLead);
      if (!dealLeadResponse) {
        throw new CustomError('Deal lead not found.', statusCodes.BAD_REQUEST);
      }

      if (dealLeadResponse.roleId !== roles.DEAL_LEAD) {
        throw new CustomError(
          'Deal can only be assigned to a deal lead.',
          statusCodes.BAD_REQUEST
        );
      }

      // Check if the stage and therapeutic area exist
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

      // Log the stage change if it's different from the current stage
      if (deal.currentStage !== stage) {
        await DealStageLog.create(
          {
            dealId: deal.id,
            stageId: stage,
            startDate: new Date() // Start date of the new stage
          },
          { transaction }
        );
      }

      // Update the deal with the new details
      await deal.update(
        {
          name,
          currentStage: stage,
          therapeuticArea,
          modifiedBy: userId
        },
        { transaction }
      );

      // Find the current active deal lead mapping for this deal
      const currentActiveDealLeadMapping = await DealLeadMapping.findOne({
        where: { dealId, isDeleted: false },
        transaction
      });

      // Check if we need to update the deal lead
      const isNewDealLeadRequired =
        !currentActiveDealLeadMapping ||
        currentActiveDealLeadMapping.userId !== dealLead;

      if (isNewDealLeadRequired) {
        // If there's an existing active deal lead, deactivate it by marking as deleted
        if (currentActiveDealLeadMapping) {
          await currentActiveDealLeadMapping.update(
            { isDeleted: true, modifiedBy: userId },
            { transaction }
          );
        }

        // Add a new record for the updated deal lead
        await DealLeadMapping.create(
          {
            userId: dealLead,
            dealId,
            createdBy: userId,
            modifiedBy: userId
          },
          { transaction }
        );
      }

      await transaction.commit();
      return apiResponse.success(null, null, 'Deal updated successfully');
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
        throw new CustomError('User not found', statusCodes.BAD_REQUEST);
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

      // Hard delete associated DealWiseResourceInfo records
      await DealWiseResourceInfo.destroy({ where: { dealId }, transaction });

      // Soft delete associated Resource deal mapping records
      await ResourceDealMapping.update(
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
      // Fetch the deal along with the related models (Stage, TherapeuticArea, DealLead, and their TherapeuticAreas)
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false },
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
              'id',
              'email',
              'novartis521ID',
              'firstName',
              'lastName',
              'title'
            ],
            include: [
              {
                model: TherapeuticArea,
                as: 'therapeuticAreas',
                attributes: ['id', 'name'],
                through: {
                  attributes: []
                }
              }
            ]
          }
        ]
      });

      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // constructing deal response
      const dealDetailResponse = new DealDetailResponseMapper(deal);

      return apiResponse.success(dealDetailResponse);
    } catch (error) {
      errorHandler.handle(error);
    }
  }

  async getDealsList(query, body) {
    try {
      const { filters, userId } = body;

      // Fetch user details to determine role
      const user = await User.findByPk(userId, {
        include: [
          {
            model: TherapeuticArea,
            as: 'therapeuticAreas',
            attributes: ['id']
          }
        ]
      });

      if (!user) {
        throw new CustomError('User not found.', statusCodes.BAD_REQUEST);
      }

      // Build filter criteria
      const where = { isDeleted: false };
      const include = [
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
          attributes: ['id', 'firstName', 'lastName'],
          through: {
            attributes: [],
            where: { isDeleted: false }
          }
        },
        {
          model: User,
          as: 'modifier',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'creator', // Fetch createdBy user details
          attributes: ['id', 'firstName', 'lastName']
        }
      ];

      // Apply role-based filtering
      if (user.roleId === roles.SYSTEM_ADMIN) {
        // System admins can view all deals, no further filtering required
      } else if (user.roleId === roles.DEAL_LEAD) {
        // Deal leads can only see deals in their assigned therapeutic areas
        where.therapeuticArea = {
          [Sequelize.Op.in]: user.therapeuticAreas.map((ta) => ta.id)
        };
      } else {
        throw new CustomError('Unauthorized access.', statusCodes.UNAUTHORIZED);
      }

      if (filters) {
        // Filter by deal name
        if (filters.name) {
          where.name = { [Sequelize.Op.iLike]: `%${filters.name}%` };
        }

        // Filter by therapeutic area
        if (filters.therapeuticArea && filters.therapeuticArea.length) {
          where.therapeuticArea = {
            [Sequelize.Op.in]: filters.therapeuticArea
          };
        }

        // Filter by stage
        if (filters.stage && filters.stage.length) {
          where.currentStage = {
            [Sequelize.Op.in]: filters.stage
          };
        }

        // Filter by createdBy (search in both firstName and lastName)
        if (filters.createdBy) {
          include.push({
            model: User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName'],
            where: {
              [Sequelize.Op.or]: [
                {
                  firstName: { [Sequelize.Op.iLike]: `%${filters.createdBy}%` }
                },
                { lastName: { [Sequelize.Op.iLike]: `%${filters.createdBy}%` } }
              ]
            }
          });
        }

        // Filter by modifiedBy (search in both firstName and lastName)
        if (filters.modifiedBy) {
          include.push({
            model: User,
            as: 'modifier',
            attributes: ['id', 'firstName', 'lastName'],
            where: {
              [Sequelize.Op.or]: [
                {
                  firstName: { [Sequelize.Op.iLike]: `%${filters.modifiedBy}%` }
                },
                {
                  lastName: { [Sequelize.Op.iLike]: `%${filters.modifiedBy}%` }
                }
              ]
            }
          });
        }

        // Filter by createdAt date (convert "YYYY-MM-DD" string to timestamp range)
        if (filters.createdAt) {
          const startOfDay = new Date(filters.createdAt);
          const endOfDay = new Date(filters.createdAt);
          endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC

          where.createdAt = {
            [Sequelize.Op.between]: [startOfDay, endOfDay]
          };
        }

        // Filter by modifiedAt date (convert "YYYY-MM-DD" string to timestamp range)
        if (filters.modifiedAt) {
          const startOfDay = new Date(filters.modifiedAt);
          const endOfDay = new Date(filters.modifiedAt);
          endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC

          where.modifiedAt = {
            [Sequelize.Op.between]: [startOfDay, endOfDay]
          };
        }

        // Filter by dealLead name (search in both firstName and lastName)
        if (filters.dealLead) {
          include.push({
            model: User,
            as: 'leadUsers',
            attributes: ['id', 'firstName', 'lastName'],
            through: {
              attributes: [],
              where: { isDeleted: false }
            },
            where: {
              [Sequelize.Op.or]: [
                {
                  firstName: { [Sequelize.Op.iLike]: `%${filters.dealLead}%` }
                },
                { lastName: { [Sequelize.Op.iLike]: `%${filters.dealLead}%` } }
              ]
            }
          });
        }
      }

      // Add sorting by modifiedAt in descending order
      const order = [['modifiedAt', 'DESC']];

      // Pass the query and filters to findAndCountAll to handle pagination
      const { data, pagination } = await this.findAndCountAll(query, {
        where,
        include,
        order
      });

      // Create response object
      const deals = data.map((deal) => ({
        id: deal.id,
        name: deal.name,
        therapeuticArea: {
          id: deal.therapeuticAreaAssociation?.id,
          name: deal.therapeuticAreaAssociation?.name
        },
        stage: {
          id: deal.stage?.id,
          name: deal.stage?.name
        },
        // createdBy: deal.creator
        //   ? {
        //       id: deal.creator.id,
        //       name: `${deal.creator.firstName} ${deal.creator.lastName}`
        //     }
        //   : null,
        // createdAt: deal.createdAt,
        modifiedBy: deal.modifier
          ? {
              id: deal.modifier.id,
              name: `${deal.modifier.firstName} ${deal.modifier.lastName}`
            }
          : null,
        modifiedAt: deal.modifiedAt,
        dealLeads: deal.leadUsers
          ? deal.leadUsers.map((leadUser) => ({
              id: leadUser.id,
              name: `${leadUser.firstName} ${leadUser.lastName}`
            }))
          : []
      }));

      return { deals, pagination };
    } catch (error) {
      errorHandler.handle(error);
    }
  }
}

module.exports = new DealService();
