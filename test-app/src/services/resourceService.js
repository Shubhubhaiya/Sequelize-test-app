const {
  DealWiseResourceInfo,
  ResourceDealMapping,
  User,
  Stage,
  Deal,
  LineFunction,
  DealLeadMapping,
  sequelize,
  Sequelize
} = require('../database/models');
const apiResponse = require('../utils/apiResponse');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');
const roles = require('../config/roles');
const BaseService = require('./baseService');
const ResourceDetailResponseMapper = require('../models/response/resourceDetailResponseMapper');
const ResourceListResponseMapper = require('../models/response/resourceListResponseMapper');

class ResourceService extends BaseService {
  constructor() {
    super(ResourceDealMapping);
  }

  async addResource(dealId, userId, resources) {
    const failedResources = [];
    let transaction;

    try {
      // Start a single transaction
      transaction = await sequelize.transaction();

      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false },
        transaction
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // Fetch the user adding the resources and validate their role
      const currentUser = await User.findByPk(userId, { transaction });
      if (!currentUser) {
        throw new CustomError('User not found', statusCodes.BAD_REQUEST);
      }

      if (currentUser.roleId === roles.DEAL_LEAD) {
        const dealLeadMapping = await DealLeadMapping.findOne({
          where: { userId: currentUser.id, dealId, isDeleted: false },
          transaction
        });
        if (!dealLeadMapping) {
          throw new CustomError(
            'Deal Leads can only add resources to their own deals',
            statusCodes.UNAUTHORIZED
          );
        }
      }

      // Fetch line functions and stages with names for mapping
      const lineFunctionIds = new Set(
        (await LineFunction.findAll({ transaction })).map((fn) => fn.id)
      );
      const stages = await Stage.findAll({ transaction });
      const stageNameMap = new Map(
        stages.map((stage) => [stage.id, stage.name])
      );

      // Prepare emails and users for lookup to avoid duplicate database calls
      const emails = resources.map((resource) => resource.email.toLowerCase());
      const users = await User.findAll({
        where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), {
          [Sequelize.Op.in]: emails
        }),
        transaction
      });

      const emailToUserMap = new Map(
        users.map((user) => [user.email.toLowerCase(), user])
      );

      // Retrieve existing mappings for the current deal
      const userIds = Array.from(emailToUserMap.values()).map(
        (user) => user.id
      );
      const existingMappings = await ResourceDealMapping.findAll({
        where: { userId: userIds, dealId },
        transaction
      });

      const mappingMap = new Map(
        existingMappings.map((mapping) => [
          `${mapping.userId}-${mapping.dealStageId}`,
          mapping
        ])
      );

      const existingResourceInfos = await DealWiseResourceInfo.findAll({
        where: { dealId, resourceId: userIds },
        transaction
      });

      const resourceInfoMap = new Map(
        existingResourceInfos.map((info) => [
          `${info.dealId}-${info.resourceId}`,
          info
        ])
      );

      const bulkNewMappings = [];
      const bulkNewResourceInfos = [];
      const successfullyMappedResources = new Set();

      // Map to keep track of the latest resource details per userId
      const resourceDetailsMap = new Map();

      // Set to track unique mappings to prevent duplicates
      const newMappingKeys = new Set();

      for (const [index, resource] of resources.entries()) {
        const {
          email,
          lineFunction,
          stages,
          vdrAccessRequested,
          webTrainingStatus,
          isCoreTeamMember,
          oneToOneDiscussion,
          optionalColumn
        } = resource;

        try {
          const user = emailToUserMap.get(email.toLowerCase());
          if (!user) {
            failedResources.push(
              `Resource ${index + 1}: Resource with email ${email} not found`
            );
            continue;
          }

          // Validate line function
          if (!lineFunctionIds.has(lineFunction)) {
            failedResources.push(
              `Resource ${index + 1}: Invalid Line Function`
            );
            continue;
          }

          let resourceMappingSuccess = false;

          for (const stageId of stages) {
            const mappingKey = `${user.id}-${stageId}`;

            // Check if this mapping is already processed in this request
            if (newMappingKeys.has(mappingKey)) {
              // Duplicate mapping detected within the request
              failedResources.push(
                `Resource ${index + 1}: Duplicate entry for ${email} in '${stageNameMap.get(stageId)}' stage within the request`
              );
              continue;
            }

            const existingMapping = mappingMap.get(mappingKey);

            if (existingMapping && !existingMapping.isDeleted) {
              // Resource already part of stage
              failedResources.push(
                `Resource ${index + 1}: ${email} is already part of '${stageNameMap.get(stageId)}' stage`
              );
              continue;
            } else if (existingMapping) {
              // Reactivate deleted mapping
              await existingMapping.update(
                { isDeleted: false, createdBy: userId, modifiedBy: userId },
                { transaction }
              );
              resourceMappingSuccess = true;
            } else {
              // Add new mapping
              bulkNewMappings.push({
                userId: user.id,
                dealId,
                dealStageId: stageId,
                isDeleted: false,
                createdBy: userId,
                modifiedBy: userId
              });
              resourceMappingSuccess = true;

              // Add to newMappingKeys to prevent duplicates
              newMappingKeys.add(mappingKey);
            }
          }

          if (resourceMappingSuccess) {
            successfullyMappedResources.add(user.id);

            // Store the latest resource details for this userId
            resourceDetailsMap.set(user.id, {
              lineFunction,
              vdrAccessRequested,
              webTrainingStatus,
              isCoreTeamMember,
              oneToOneDiscussion,
              optionalColumn
            });
          }
        } catch (error) {
          failedResources.push(`Resource ${index + 1}: ${error.message}`);
        }
      }

      // Update or create DealWiseResourceInfo using the latest details
      for (const userId of successfullyMappedResources) {
        const resourceInfoKey = `${dealId}-${userId}`;
        const existingResourceInfo = resourceInfoMap.get(resourceInfoKey);
        const resourceDetails = resourceDetailsMap.get(userId);

        if (!resourceDetails) continue; // Should not happen

        if (existingResourceInfo) {
          await existingResourceInfo.update(
            {
              ...resourceDetails,
              modifiedBy: userId
            },
            { transaction }
          );
        } else {
          bulkNewResourceInfos.push({
            dealId,
            resourceId: userId,
            ...resourceDetails,
            createdBy: userId,
            modifiedBy: userId
          });
        }
      }

      // Perform bulk insert for new mappings and resource info entries
      if (bulkNewMappings.length > 0) {
        await ResourceDealMapping.bulkCreate(bulkNewMappings, { transaction });
      }
      if (bulkNewResourceInfos.length > 0) {
        await DealWiseResourceInfo.bulkCreate(bulkNewResourceInfos, {
          transaction
        });
      }

      // Commit transaction after processing all resources
      await transaction.commit();

      // Return appropriate response
      return failedResources.length > 0
        ? { message: 'Some resources failed to be added', failedResources }
        : apiResponse.success(null, null, 'Resources added successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }

  async getResourceList(query, body) {
    const { dealId, filters = {} } = body;
    const { page = 1, limit = 10 } = query;

    try {
      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false }
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // Base where clause for ResourceDealMapping
      const whereClause = {
        isDeleted: false,
        dealId
      };

      // Apply filters directly on ResourceDealMapping
      if (filters.stage && filters.stage.length > 0) {
        whereClause.dealStageId = {
          [Sequelize.Op.in]: filters.stage
        };
      }

      // Apply additional filters if provided
      const resourceInfoWhere = {};
      const resourceWhere = {};

      // ===============================
      // Filters on DealWiseResourceInfo
      // ===============================

      // Filter by lineFunction
      if (filters.lineFunction && filters.lineFunction.length > 0) {
        resourceInfoWhere.lineFunction = {
          [Sequelize.Op.in]: filters.lineFunction
        };
      }

      // Filter by isCoreTeamMember
      if (
        filters.isCoreTeamMember !== null &&
        filters.isCoreTeamMember !== undefined
      ) {
        resourceInfoWhere.isCoreTeamMember = filters.isCoreTeamMember;
      }

      // Filter by VDR Access Requested
      if (
        filters.vdrAccessRequested !== null &&
        filters.vdrAccessRequested !== undefined
      ) {
        resourceInfoWhere.vdrAccessRequested = filters.vdrAccessRequested;
      }

      // Filter by Web Training Status
      if (filters.webTrainingStatus && filters.webTrainingStatus.length > 0) {
        resourceInfoWhere.webTrainingStatus = {
          [Sequelize.Op.in]: filters.webTrainingStatus
        };
      }

      // Filter by optionalColumn
      if (filters.optionalColumn) {
        resourceInfoWhere.optionalColumn = {
          [Sequelize.Op.iLike]: `${filters.optionalColumn}%`
        };
      }

      // Filter by oneToOneDiscussion
      if (filters.oneToOneDiscussion) {
        resourceInfoWhere.oneToOneDiscussion = {
          [Sequelize.Op.iLike]: `${filters.oneToOneDiscussion}%`
        };
      }

      // =====================
      // Filters on User
      // =====================

      // Filter by name
      if (filters.name) {
        resourceWhere[Sequelize.Op.or] = [
          {
            firstName: { [Sequelize.Op.iLike]: `${filters.name}%` }
          },
          {
            lastName: { [Sequelize.Op.iLike]: `${filters.name}%` }
          },
          Sequelize.where(
            Sequelize.fn(
              'concat',
              Sequelize.col('firstName'),
              ' ',
              Sequelize.col('lastName')
            ),
            {
              [Sequelize.Op.iLike]: `${filters.name}%`
            }
          )
        ];
      }

      // Filter by email
      if (filters.email) {
        resourceWhere.email = {
          [Sequelize.Op.iLike]: `${filters.email}%`
        };
      }

      // Filter by title
      if (filters.title) {
        resourceWhere.title = {
          [Sequelize.Op.iLike]: `${filters.title}%`
        };
      }

      // Filter by novartis521ID
      if (filters.novartis521ID) {
        resourceWhere.novartis521ID = {
          [Sequelize.Op.iLike]: `${filters.novartis521ID}%`
        };
      }

      // Filter by siteCode
      if (filters.siteCode) {
        resourceWhere.siteCode = {
          [Sequelize.Op.iLike]: `${filters.siteCode}%`
        };
      }

      // Define sorting order
      const order = [['modifiedAt', 'DESC']];

      // Execute the main data query without includes
      const { count, rows } = await ResourceDealMapping.findAndCountAll({
        where: whereClause,
        attributes: [
          'userId',
          'dealId',
          'dealStageId',
          'createdBy',
          'modifiedBy',
          'isDeleted',
          'createdAt',
          'modifiedAt'
        ],
        order,
        distinct: true
      });

      // Extract unique userIds and dealStageIds from the results
      const userIds = [...new Set(rows.map((row) => row.userId))];
      const dealStageIds = [...new Set(rows.map((row) => row.dealStageId))];

      // Fetch associated data separately
      const [resourceInfos, users, stages] = await Promise.all([
        // Fetch DealWiseResourceInfo with filters
        DealWiseResourceInfo.findAll({
          where: {
            resourceId: { [Sequelize.Op.in]: userIds },
            dealId: dealId,
            ...resourceInfoWhere
          },
          include: [
            {
              model: LineFunction,
              as: 'associatedLineFunction',
              attributes: ['id', 'name']
            }
          ]
        }),
        // Fetch Users with filters
        User.findAll({
          where: {
            id: { [Sequelize.Op.in]: userIds },
            ...resourceWhere
          },
          attributes: [
            'id',
            'firstName',
            'lastName',
            'title',
            'email',
            'novartis521ID',
            'siteCode'
          ]
        }),
        // Fetch Stages
        Stage.findAll({
          where: { id: { [Sequelize.Op.in]: dealStageIds } },
          attributes: ['id', 'name']
        })
      ]);

      // Map data for easy access
      const resourceInfoMap = new Map();
      resourceInfos.forEach((info) => {
        resourceInfoMap.set(`${info.dealId}-${info.resourceId}`, info);
      });

      const userMap = new Map();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      const stageMap = new Map();
      stages.forEach((stage) => {
        stageMap.set(stage.id, stage);
      });

      // Assemble the final data
      const resources = rows
        .map((row) => {
          const resourceInfo = resourceInfoMap.get(
            `${row.dealId}-${row.userId}`
          );
          const user = userMap.get(row.userId);
          const stage = stageMap.get(row.dealStageId);

          // Exclude records if associated data doesn't meet the filters
          if (!user || !resourceInfo) {
            return null;
          }

          return {
            // Use composite key or another unique identifier
            id: user.id,
            recordKey: `${row.userId}-${row.dealId}-${row.dealStageId}`,
            lineFunction: resourceInfo.associatedLineFunction || null,
            name: `${user.firstName} ${user.lastName}`,
            stage: stage || null,
            title: user.title,
            email: user.email,
            vdrAccessRequested: resourceInfo.vdrAccessRequested,
            webTrainingStatus: resourceInfo.webTrainingStatus,
            novartis521ID: user.novartis521ID,
            isCoreTeamMember: resourceInfo.isCoreTeamMember,
            oneToOneDiscussion: resourceInfo.oneToOneDiscussion,
            optionalColumn: resourceInfo.optionalColumn,
            siteCode: user.siteCode
          };
        })
        .filter((resource) => resource !== null);

      // Update count after filters
      const totalRecords = resources.length;
      const totalPages = Math.ceil(totalRecords / limit);
      const pagination = {
        totalRecords,
        currentPage: page,
        totalPages,
        pageSize: limit
      };

      // Paginate the final results
      const offset = (page - 1) * limit;
      const paginatedResources = resources.slice(offset, offset + limit);

      // Return data with pagination
      if (paginatedResources.length > 0) {
        return { data: paginatedResources, ...pagination };
      } else {
        return { data: [], ...pagination };
      }
    } catch (error) {
      console.error(error);
      errorHandler.handle(error);
    }
  }

  async removeResourceFromStage({ dealId, stageId, resourceId, userId }) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false },
        transaction
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // Check if the user exists and fetch their details
      const currentUser = await User.findByPk(userId);
      if (!currentUser) {
        throw new CustomError('User not found', statusCodes.BAD_REQUEST);
      }

      // Check if the user is a System Admin
      if (
        currentUser.roleId !== roles.SYSTEM_ADMIN &&
        currentUser.roleId !== roles.DEAL_LEAD
      ) {
        throw new CustomError(
          'You are not authorized to delete resource',
          statusCodes.UNAUTHORIZED
        );
      }

      // Deal lead can only delete resources from their own deals
      if (currentUser.roleId === roles.DEAL_LEAD) {
        const dealLeadMapping = await DealLeadMapping.findOne({
          where: { userId: currentUser.id, dealId, isDeleted: false }
        });
        if (!dealLeadMapping) {
          throw new CustomError(
            'Deal leads can only delete resources from their own deals',
            statusCodes.UNAUTHORIZED
          );
        }
      }

      // Check if the resource exists in this stage of the deal
      const resourceMapping = await ResourceDealMapping.findOne({
        where: {
          dealId,
          dealStageId: stageId,
          userId: resourceId,
          isDeleted: false
        },
        transaction
      });
      if (!resourceMapping) {
        throw new CustomError(
          'Resource not found in this stage of the deal',
          statusCodes.BAD_REQUEST
        );
      }

      // Soft delete the resource
      await resourceMapping.update(
        { isDeleted: true, modifiedBy: userId },
        { transaction }
      );

      // Check if the resource is deleted from all stages of the deal
      const remainingStages = await ResourceDealMapping.findAll({
        where: {
          dealId,
          userId: resourceId,
          isDeleted: false
        },
        transaction
      });

      // If the resource is deleted from all stages, delete from DealWiseResourceInfo
      if (remainingStages.length === 0) {
        await DealWiseResourceInfo.destroy({
          where: { dealId, resourceId },
          transaction
        });
      }

      await transaction.commit();
      return { message: 'Resource deleted successfully' };
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }

  async getResourceDetail(resourceId, dealId, stageId) {
    try {
      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false }
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // Fetch the resource details by resourceId and dealId
      const resource = await ResourceDealMapping.findOne({
        where: {
          userId: resourceId,
          dealId,
          dealStageId: stageId,
          isDeleted: false
        },
        include: [
          {
            model: User,
            as: 'resource',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'title',
              'email',
              'novartis521ID',
              'siteCode'
            ]
          },
          {
            model: DealWiseResourceInfo,
            as: 'resourceInfo',
            attributes: [
              'vdrAccessRequested',
              'webTrainingStatus',
              'oneToOneDiscussion',
              'optionalColumn',
              'isCoreTeamMember',
              'lineFunction'
            ],
            include: [
              {
                model: LineFunction,
                as: 'associatedLineFunction',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Stage,
            as: 'stage',
            attributes: ['id', 'name']
          }
        ]
      });

      //throw an error
      if (!resource) {
        throw new CustomError('Resource not found', statusCodes.BAD_REQUEST);
      }

      // Format the response
      const resourceDetailResponse = new ResourceDetailResponseMapper(resource);
      return resourceDetailResponse;
    } catch (error) {
      errorHandler.handle(error);
    }
  }

  async updateResource(dealId, stageId, userId, resourceData) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const {
        resourceId,
        email,
        vdrAccessRequested,
        webTrainingStatus,
        oneToOneDiscussion,
        optionalColumn,
        isCoreTeamMember,
        lineFunction
      } = resourceData;

      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false },
        transaction
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      // Fetch the user performing the update
      const currentUser = await User.findByPk(userId, { transaction });
      if (!currentUser) {
        throw new CustomError('User not found', statusCodes.BAD_REQUEST);
      }

      // Deal Lead can only update resources for deals they lead
      if (currentUser.roleId === roles.DEAL_LEAD) {
        const dealLeadMapping = await DealLeadMapping.findOne({
          where: { userId: currentUser.id, dealId, isDeleted: false },
          transaction
        });
        if (!dealLeadMapping) {
          throw new CustomError(
            'Deal Leads can only update resources in their own deals',
            statusCodes.UNAUTHORIZED
          );
        }
      }

      // Fetch the existing resource by resourceId
      const existingResource = await User.findOne({
        where: { id: resourceId },
        transaction
      });

      if (!existingResource) {
        throw new CustomError('Resource not found', statusCodes.NOT_FOUND);
      }

      // If the email matches, simply update DealWiseResourceInfo
      if (existingResource.email.toLowerCase() === email.toLowerCase()) {
        await DealWiseResourceInfo.update(
          {
            lineFunction,
            vdrAccessRequested,
            webTrainingStatus,
            oneToOneDiscussion,
            optionalColumn,
            isCoreTeamMember,
            modifiedBy: userId
          },
          { where: { dealId, resourceId }, transaction }
        );
      } else {
        // Handle case where the resource is being replaced

        // Step 1: Remove old resource mapping from the stage
        const oldResourceMapping = await ResourceDealMapping.findOne({
          where: {
            dealId,
            dealStageId: stageId,
            userId: resourceId,
            isDeleted: false
          },
          transaction
        });

        if (!oldResourceMapping) {
          throw new CustomError(
            'Resource not found in this stage of the deal',
            statusCodes.NOT_FOUND
          );
        }

        await oldResourceMapping.update(
          { isDeleted: true, modifiedBy: userId },
          { transaction }
        );

        // Step 2: Check if the old resource is still part of any other stages within the deal
        const remainingStages = await ResourceDealMapping.findAll({
          where: {
            dealId,
            userId: resourceId,
            isDeleted: false
          },
          transaction
        });

        if (remainingStages.length === 0) {
          // If the old resource is not part of any other stage, delete DealWiseResourceInfo
          await DealWiseResourceInfo.destroy({
            where: { dealId, resourceId },
            transaction
          });
        }

        // Step 3: Find the new resource by email
        const newResource = await User.findOne({
          where: { email: { [Sequelize.Op.iLike]: email } },
          transaction
        });

        // if new resource not found in our system
        // then check in active directory
        // return error if not found there also
        // if found insert entry in user table and then use it's id

        if (!newResource) {
          throw new CustomError(
            `New resource with email ${email} not found!`,
            statusCodes.NOT_FOUND
          );
        }

        // Step 4: Check if the new resource already has DealWiseResourceInfo for this deal
        const newResourceDealInfo = await DealWiseResourceInfo.findOne({
          where: { dealId, resourceId: newResource.id },
          transaction
        });

        if (newResourceDealInfo) {
          // Update the new resource's DealWiseResourceInfo
          await newResourceDealInfo.update(
            {
              vdrAccessRequested,
              webTrainingStatus,
              oneToOneDiscussion,
              optionalColumn,
              isCoreTeamMember,
              lineFunction,
              modifiedBy: userId
            },
            { transaction }
          );
        } else {
          // Create a new DealWiseResourceInfo entry for the new resource
          await DealWiseResourceInfo.create(
            {
              dealId,
              resourceId: newResource.id,
              lineFunction,
              vdrAccessRequested,
              webTrainingStatus,
              oneToOneDiscussion,
              optionalColumn,
              isCoreTeamMember,
              createdBy: userId,
              modifiedBy: userId
            },
            { transaction }
          );
        }

        // Step 5: Check if the new resource already has a mapping for this stage
        const existingMappingNewResource = await ResourceDealMapping.findOne({
          where: {
            dealId,
            dealStageId: stageId,
            userId: newResource.id
          },
          transaction
        });

        if (existingMappingNewResource) {
          if (existingMappingNewResource.isDeleted) {
            // If mapping exists but is deleted, reactivate it by setting `isDeleted` to false
            await existingMappingNewResource.update(
              { isDeleted: false, createdBy: userId, modifiedBy: userId },
              { transaction }
            );
          } else {
            throw new CustomError(
              `Resource with email ${email} already part of this stage`,
              statusCodes.CONFLICT
            );
          }
        } else {
          // Step 6: Add the new resource mapping to ResourceDealMapping for this stage
          await ResourceDealMapping.create(
            {
              userId: newResource.id,
              dealId,
              dealStageId: stageId,
              isDeleted: false,
              createdBy: userId,
              modifiedBy: userId
            },
            { transaction }
          );
        }
      }

      // Commit the transaction
      await transaction.commit();
      return apiResponse.success(null, null, 'Resource updated successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }
}

module.exports = new ResourceService();
