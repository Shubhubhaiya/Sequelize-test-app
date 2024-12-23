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
const { createAuditTrailEntry } = require('../utils/auditTrailEntry');
const { action, entity } = require('../config/auditTrail');

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

      if (userResponse.roleId !== roles.SYSTEM_ADMIN) {
        throw new CustomError(
          'Only System Admins are authorized to create deals.',
          statusCodes.UNAUTHORIZED
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

      // Validate stage and therapeutic area existence and retrieve names
      const [stageResponse, therapeuticAreaResponse] = await Promise.all([
        Stage.findByPk(stage),
        TherapeuticArea.findByPk(therapeuticArea)
      ]);

      if (!stageResponse) {
        throw new CustomError('Stage does not exist.', statusCodes.BAD_REQUEST);
      }
      if (!therapeuticAreaResponse) {
        throw new CustomError(
          'Therapeutic area does not exist.',
          statusCodes.BAD_REQUEST
        );
      }

      // Validate deal lead existence and role
      const dealLeadResponse = await User.findByPk(dealLead);
      if (!dealLeadResponse) {
        throw new CustomError('Deal lead not found.', statusCodes.BAD_REQUEST);
      }
      if (dealLeadResponse.roleId !== roles.DEAL_LEAD) {
        throw new CustomError(
          'Deal can only be assigned to deal lead.',
          statusCodes.BAD_REQUEST
        );
      }

      // Validate deal lead's association with therapeutic area
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

      const userName = `${userResponse.lastName}, ${userResponse.firstName}`;

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
          stageId: stage,
          startDate: new Date()
        },
        { transaction }
      );

      // Create DealLeadMapping entry if the deal lead is valid
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

      // Prepare audit trail data
      const auditData = {
        dealId: newDeal.id,
        action: action.CREATED,
        entityId: newDeal.id,
        entityType: entity.DEAL,
        description: `${userName} created this New deal with name '${name}'`,
        performedBy: userId,
        actionDate: new Date()
      };

      // Enqueue the audit trail entry
      createAuditTrailEntry(auditData);

      return apiResponse.success(null, null, 'Deal created successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }

  async updateDeal(dealId, data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const { name, stage, therapeuticArea, userId, dealLead } = data;

      // Pre-fetch necessary data in parallel
      const [
        deal,
        isDealWithSameNameExists,
        user,
        dealLeadResponse,
        isStageExists,
        isTherapeuticAreaExist
      ] = await Promise.all([
        Deal.findByPk(dealId),
        Deal.findOne({
          where: {
            name: { [Sequelize.Op.iLike]: name },
            id: { [Sequelize.Op.ne]: dealId },
            isDeleted: false
          }
        }),
        User.findByPk(userId),
        User.findByPk(dealLead),
        Stage.findByPk(stage),
        TherapeuticArea.findByPk(therapeuticArea)
      ]);

      // Validations
      if (!deal)
        throw new CustomError('Deal not found.', statusCodes.NOT_FOUND);

      if (isDealWithSameNameExists)
        throw new CustomError(
          'This deal name is already in use.',
          statusCodes.CONFLICT
        );

      if (!user || user.roleId !== roles.SYSTEM_ADMIN)
        throw new CustomError(
          'Only system admin can update the deal',
          statusCodes.UNAUTHORIZED
        );

      if (!dealLeadResponse || dealLeadResponse.roleId !== roles.DEAL_LEAD)
        throw new CustomError(
          'Deal can only be assigned to a deal lead.',
          statusCodes.BAD_REQUEST
        );

      if (!isStageExists)
        throw new CustomError('Stage not found.', statusCodes.BAD_REQUEST);

      if (!isTherapeuticAreaExist)
        throw new CustomError(
          'Therapeutic Area not found',
          statusCodes.BAD_REQUEST
        );

      // Validate deal lead’s association with the therapeutic area
      const isDealLeadAssociatedWithTherapeuticArea = await User.findByPk(
        dealLead,
        {
          include: {
            model: TherapeuticArea,
            as: 'therapeuticAreas',
            where: { id: therapeuticArea }
          }
        }
      );

      if (!isDealLeadAssociatedWithTherapeuticArea) {
        throw new CustomError(
          'Deal Lead is not associated with this Therapeutic Area.',
          statusCodes.BAD_REQUEST
        );
      }

      // Initialize audit entries array
      const auditEntries = [];
      const userName = `${user.lastName}, ${user.firstName} `;

      // Collect change information for audit trail
      if (deal.name !== name) {
        auditEntries.push({
          dealId,
          action: action.RENAMED,
          entityType: entity.DEAL,
          entityId: dealId,
          fieldChanged: 'name',
          oldValue: deal.name,
          newValue: name,
          performedBy: userId,
          description: `${userName} renamed this deal from '${deal.name}' to '${name}'`
        });
      }

      if (deal.currentStage !== stage) {
        const [oldStage, newStage] = await Promise.all([
          Stage.findByPk(deal.currentStage),
          Stage.findByPk(stage)
        ]);
        auditEntries.push({
          dealId,
          action: action.UPDATED,
          entityType: entity.DEAL,
          entityId: dealId,
          fieldChanged: 'stage',
          oldValue: oldStage.name,
          newValue: newStage.name,
          performedBy: userId,
          description: `${userName} updated the stage from '${oldStage.name}' to '${newStage.name}'`
        });
        await DealStageLog.create(
          {
            dealId: deal.id,
            stageId: stage,
            startDate: new Date()
          },
          { transaction }
        );
      }

      if (deal.therapeuticArea !== therapeuticArea) {
        const [oldTherapeuticArea, newTherapeuticArea] = await Promise.all([
          TherapeuticArea.findByPk(deal.therapeuticArea),
          TherapeuticArea.findByPk(therapeuticArea)
        ]);
        auditEntries.push({
          dealId,
          action: action.UPDATED,
          entityType: entity.DEAL,
          entityId: dealId,
          fieldChanged: 'therapeuticArea',
          oldValue: oldTherapeuticArea.name,
          newValue: newTherapeuticArea.name,
          performedBy: userId,
          description: `${userName} changed the therapeutic area from '${oldTherapeuticArea.name}' to '${newTherapeuticArea.name}'`
        });
      }

      // Update the deal
      await deal.update(
        {
          name,
          currentStage: stage,
          therapeuticArea,
          modifiedBy: userId
        },
        { transaction }
      );

      // Deal lead update logic with names
      const activeDealLeadMapping = await DealLeadMapping.findOne({
        where: { dealId, isDeleted: false }
      });
      if (activeDealLeadMapping && activeDealLeadMapping.userId !== dealLead) {
        const [oldDealLead, newDealLeadUser] = await Promise.all([
          User.findByPk(activeDealLeadMapping.userId),
          User.findByPk(dealLead)
        ]);

        await activeDealLeadMapping.update(
          { isDeleted: true, modifiedBy: userId },
          { transaction }
        );

        const inactiveDealLeadMapping = await DealLeadMapping.findOne({
          where: { dealId, userId: dealLead, isDeleted: true }
        });
        if (inactiveDealLeadMapping) {
          await inactiveDealLeadMapping.update(
            { isDeleted: false, modifiedBy: userId },
            { transaction }
          );
        } else {
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

        // Log deal lead change
        auditEntries.push({
          dealId,
          action: action.UPDATED,
          entityType: entity.DEAL,
          entityId: dealId,
          fieldChanged: 'dealLead',
          oldValue: `${oldDealLead.firstName} ${oldDealLead.lastName}`,
          newValue: `${newDealLeadUser.firstName} ${newDealLeadUser.lastName}`,
          performedBy: userId,
          description: `${userName} changed the deal lead from '${oldDealLead.firstName} ${oldDealLead.lastName}' to '${newDealLeadUser.firstName} ${newDealLeadUser.lastName}'`
        });
      }

      // Commit transaction
      await transaction.commit();

      // Enqueue audit entries asynchronously
      auditEntries.forEach((entry) => createAuditTrailEntry(entry));

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

      // Retrieve username and role for audit entry
      const userName = `${user.lastName}, ${user.firstName} `;

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

      // Soft delete associated ResourceDealMapping records
      await ResourceDealMapping.update(
        { isDeleted: true },
        { where: { dealId }, transaction }
      );

      // Commit the transaction after all operations are successful
      await transaction.commit();

      // Prepare audit trail data
      const auditData = {
        dealId,
        action: action.REMOVED,
        entityId: dealId,
        entityType: entity.DEAL,
        description: `${userName} deleted the deal '${deal.name}'`,
        performedBy: userId
      };

      // Enqueue the audit trail entry asynchronously
      createAuditTrailEntry(auditData);

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
