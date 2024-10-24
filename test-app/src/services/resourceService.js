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

      // Iterate through each resource and handle the transaction for each
      for (const [index, resource] of resources.entries()) {
        let individualTransaction;
        try {
          individualTransaction = await sequelize.transaction();

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

          // Validate line function
          const lineFunctionExists = await LineFunction.findByPk(lineFunction, {
            transaction: individualTransaction
          });
          if (!lineFunctionExists) {
            throw new CustomError(
              `Line Function with ID ${lineFunction} not found`,
              statusCodes.BAD_REQUEST
            );
          }

          // Validate stages
          const validStages = await Stage.findAll({
            where: { id: stages },
            transaction: individualTransaction
          });
          const foundStageIds = validStages.map((stage) => stage.id);
          const invalidStages = stages.filter(
            (stageId) => !foundStageIds.includes(stageId)
          );
          if (invalidStages.length > 0) {
            throw new CustomError(
              `Invalid stage(s): ${invalidStages.join(', ')}`,
              statusCodes.BAD_REQUEST
            );
          }

          // Search for the resource by email
          let user = await User.findOne({
            where: { email: { [Sequelize.Op.iLike]: email } },
            transaction: individualTransaction
          });
          if (!user) {
            throw new CustomError(
              `Resource with email ${email} not found!`,
              statusCodes.BAD_REQUEST
            );
          }

          // Check if resource is already assigned to the same deal and stage
          for (const stageId of stages) {
            const existingMapping = await ResourceDealMapping.findOne({
              where: {
                userId: user.id,
                dealId: dealId,
                dealStageId: stageId
              },
              transaction: individualTransaction
            });

            const stage = await Stage.findByPk(stageId, {
              transaction: individualTransaction
            });

            if (existingMapping) {
              if (existingMapping.isDeleted) {
                await existingMapping.update(
                  { isDeleted: false, createdBy: userId, modifiedBy: userId },
                  { transaction: individualTransaction }
                );
              } else {
                throw new CustomError(
                  `(${email}) is already part of ${stage.name} stage`,
                  statusCodes.CONFLICT
                );
              }
            } else {
              await ResourceDealMapping.create(
                {
                  userId: user.id,
                  dealId,
                  dealStageId: stageId,
                  isDeleted: false,
                  createdBy: userId,
                  modifiedBy: userId
                },
                { transaction: individualTransaction }
              );
            }
          }

          // Insert or update resource data in DealWiseResourceInfo table
          const existingResourceInfo = await DealWiseResourceInfo.findOne({
            where: { dealId, resourceId: user.id },
            transaction: individualTransaction
          });

          if (existingResourceInfo) {
            await existingResourceInfo.update(
              {
                vdrAccessRequested,
                webTrainingStatus,
                oneToOneDiscussion,
                optionalColumn,
                isCoreTeamMember,
                lineFunction,
                modifiedBy: userId
              },
              { transaction: individualTransaction }
            );
          } else {
            await DealWiseResourceInfo.create(
              {
                dealId,
                resourceId: user.id,
                lineFunction,
                vdrAccessRequested,
                webTrainingStatus,
                oneToOneDiscussion,
                optionalColumn,
                isCoreTeamMember,
                createdBy: userId,
                modifiedBy: userId
              },
              { transaction: individualTransaction }
            );
          }

          // Commit transaction for this resource
          await individualTransaction.commit();
        } catch (error) {
          // Rollback individual resource transaction
          if (individualTransaction) await individualTransaction.rollback();

          // Log the failure resource with number
          failedResources.push(`resource ${index + 1}: ${error.message}`);
        }
      }

      // Return different responses based on whether there are failed resources
      if (failedResources.length > 0) {
        return {
          message: 'Some resources failed to be added',
          failedResources
        };
      } else {
        return apiResponse.success(
          null,
          null,
          'Resource(s) added successfully'
        );
      }
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

      const offset = (page - 1) * limit;

      // Base where clause for ResourceDealMapping
      const whereClause = { isDeleted: false };
      const replacements = {};
      const whereConditions = [`"ResourceDealMapping"."isDeleted" = false`];

      // Apply dealId filter if provided
      if (dealId) {
        whereClause.dealId = dealId;
        whereConditions.push(`"ResourceDealMapping"."dealId" = :dealId`);
        replacements.dealId = dealId;
      }

      // Define includes with custom join condition for resourceInfo
      const include = [
        {
          model: DealWiseResourceInfo,
          as: 'resourceInfo',
          attributes: [
            'vdrAccessRequested',
            'webTrainingStatus',
            'oneToOneDiscussion',
            'optionalColumn',
            'isCoreTeamMember',
            'lineFunction',
            'modifiedAt'
          ],
          include: [
            {
              model: LineFunction,
              as: 'associatedLineFunction',
              attributes: ['id', 'name']
            }
          ],
          required: true,
          on: {
            [Sequelize.Op.and]: [
              Sequelize.where(
                Sequelize.col('ResourceDealMapping.userId'),
                Sequelize.Op.eq,
                Sequelize.col('resourceInfo.resourceId')
              ),
              Sequelize.where(
                Sequelize.col('ResourceDealMapping.dealId'),
                Sequelize.Op.eq,
                Sequelize.col('resourceInfo.dealId')
              )
            ]
          }
        },
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
          model: Stage,
          as: 'stage',
          attributes: ['id', 'name']
        }
      ];

      // Apply filters if provided
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
        whereConditions.push(
          `"resourceInfo"."lineFunction" IN (:lineFunctions)`
        );
        replacements.lineFunctions = filters.lineFunction;
      }

      // Filter by isCoreTeamMember
      if (
        filters.isCoreTeamMember !== null &&
        filters.isCoreTeamMember !== undefined
      ) {
        resourceInfoWhere.isCoreTeamMember = filters.isCoreTeamMember;
        whereConditions.push(
          `"resourceInfo"."isCoreTeamMember" = :isCoreTeamMember`
        );
        replacements.isCoreTeamMember = filters.isCoreTeamMember;
      }

      // Filter by VDR Access Requested
      if (
        filters.vdrAccessRequested !== null &&
        filters.vdrAccessRequested !== undefined
      ) {
        resourceInfoWhere.vdrAccessRequested = filters.vdrAccessRequested;
        whereConditions.push(
          `"resourceInfo"."vdrAccessRequested" = :vdrAccessRequested`
        );
        replacements.vdrAccessRequested = filters.vdrAccessRequested;
      }

      // Filter by Web Training Status (case-insensitive)
      if (filters.webTrainingStatus && filters.webTrainingStatus.length > 0) {
        const enumStatusValues = filters.webTrainingStatus;

        if (enumStatusValues.length > 0) {
          resourceInfoWhere.webTrainingStatus = {
            [Sequelize.Op.in]: enumStatusValues
          };
          whereConditions.push(
            `"resourceInfo"."webTrainingStatus" IN (:enumStatusValues)`
          );
          replacements.enumStatusValues = enumStatusValues;
        }
      }

      // Filter by optionalColumn
      if (filters.optionalColumn) {
        const optionalColumnFilter = filters.optionalColumn;
        if (optionalColumnFilter !== '') {
          resourceInfoWhere.optionalColumn = {
            [Sequelize.Op.iLike]: `%${optionalColumnFilter}%`
          };
          whereConditions.push(
            `"resourceInfo"."optionalColumn" ILIKE :optionalColumnFilter`
          );
          replacements.optionalColumnFilter = `%${optionalColumnFilter}%`;
        }
      }

      // Filter by oneToOneDiscussion
      if (filters.oneToOneDiscussion) {
        const oneToOneDiscussionFilter = filters.oneToOneDiscussion;
        if (oneToOneDiscussionFilter !== '') {
          resourceInfoWhere.oneToOneDiscussion = {
            [Sequelize.Op.iLike]: `%${oneToOneDiscussionFilter}%`
          };
          whereConditions.push(
            `"resourceInfo"."oneToOneDiscussion" ILIKE :oneToOneDiscussionFilter`
          );
          replacements.oneToOneDiscussionFilter = `%${oneToOneDiscussionFilter}%`;
        }
      }

      // Apply DealWiseResourceInfo filters
      if (Object.keys(resourceInfoWhere).length > 0) {
        const resourceInfoInclude = include.find(
          (inc) => inc.as === 'resourceInfo'
        );
        resourceInfoInclude.where = {
          ...resourceInfoInclude.where,
          ...resourceInfoWhere
        };
        resourceInfoInclude.required = true;
      }

      // =====================
      // Filters on User (resource)
      // =====================

      // Filter by name
      if (filters.name) {
        const nameFilter = filters.name;
        if (nameFilter !== '') {
          resourceWhere[Sequelize.Op.or] = [
            {
              firstName: { [Sequelize.Op.iLike]: `%${nameFilter}%` }
            },
            {
              lastName: { [Sequelize.Op.iLike]: `%${nameFilter}%` }
            },
            Sequelize.where(
              Sequelize.fn(
                'concat',
                Sequelize.col('resource.firstName'),
                ' ',
                Sequelize.col('resource.lastName')
              ),
              {
                [Sequelize.Op.iLike]: `%${nameFilter}%`
              }
            )
          ];
          whereConditions.push(
            `(("resource"."firstName" ILIKE :nameFilter) OR ("resource"."lastName" ILIKE :nameFilter) OR ("resource"."firstName" || ' ' || "resource"."lastName" ILIKE :nameFilter))`
          );
          replacements.nameFilter = `%${nameFilter}%`;
        }
      }

      // Filter by email
      if (filters.email) {
        const emailFilter = filters.email;
        if (emailFilter !== '') {
          resourceWhere.email = {
            [Sequelize.Op.iLike]: `%${emailFilter}%`
          };
          whereConditions.push(`"resource"."email" ILIKE :emailFilter`);
          replacements.emailFilter = `%${emailFilter}%`;
        }
      }

      // Filter by title
      if (filters.title) {
        const titleFilter = filters.title;
        if (titleFilter !== '') {
          resourceWhere.title = {
            [Sequelize.Op.iLike]: `%${titleFilter}%`
          };
          whereConditions.push(`"resource"."title" ILIKE :titleFilter`);
          replacements.titleFilter = `%${titleFilter}%`;
        }
      }

      // Filter by novartis521ID
      if (filters.novartis521ID) {
        const idFilter = filters.novartis521ID;
        if (idFilter !== '') {
          resourceWhere.novartis521ID = {
            [Sequelize.Op.iLike]: `%${idFilter}%`
          };
          whereConditions.push(
            `"resource"."novartis521ID" ILIKE :novartis521IDFilter`
          );
          replacements.novartis521IDFilter = `%${idFilter}%`;
        }
      }

      // Filter by siteCode
      if (filters.siteCode) {
        const siteCodeFilter = filters.siteCode;
        if (siteCodeFilter !== '') {
          resourceWhere.siteCode = {
            [Sequelize.Op.iLike]: `%${siteCodeFilter}%`
          };
          whereConditions.push(`"resource"."siteCode" ILIKE :siteCodeFilter`);
          replacements.siteCodeFilter = `%${siteCodeFilter}%`;
        }
      }

      // Apply User filters
      if (Object.keys(resourceWhere).length > 0) {
        const resourceInclude = include.find((inc) => inc.as === 'resource');
        resourceInclude.where = {
          ...resourceInclude.where,
          ...resourceWhere
        };
        resourceInclude.required = true;
      }

      // Filter by stages
      if (filters.stage && filters.stage.length > 0) {
        whereClause.dealStageId = {
          [Sequelize.Op.in]: filters.stage
        };
        whereConditions.push(
          `"ResourceDealMapping"."dealStageId" IN (:stages)`
        );
        replacements.stages = filters.stage;
      }

      // Define sorting order
      const order = [
        ['userId', 'ASC'],
        ['dealId', 'ASC'],
        ['dealStageId', 'ASC'],
        ['modifiedAt', 'DESC']
      ];

      // Execute the data query
      const data = await ResourceDealMapping.findAll({
        where: whereClause,
        include,
        attributes: [
          Sequelize.literal(
            `DISTINCT ON("ResourceDealMapping"."userId", "ResourceDealMapping"."dealId", "ResourceDealMapping"."dealStageId") "ResourceDealMapping".*`
          ),
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
        limit,
        offset,
        raw: true,
        nest: true
      });

      // Map the results to the desired format
      const resources = ResourceListResponseMapper.mapResourceList(data);
      // Compile the WHERE conditions into a single string for the count query
      const whereClauseString = whereConditions.join(' AND ');

      // Execute the count query for pagination
      const countQuery = `
          SELECT COUNT(*) FROM (
            SELECT DISTINCT "ResourceDealMapping"."userId", "ResourceDealMapping"."dealId", "ResourceDealMapping"."dealStageId"
            FROM "ResourceDealMapping"
            INNER JOIN "DealWiseResourceInfo" AS "resourceInfo"
              ON "ResourceDealMapping"."dealId" = "resourceInfo"."dealId"
              AND "ResourceDealMapping"."userId" = "resourceInfo"."resourceId"
            LEFT OUTER JOIN "LineFunctions" AS "associatedLineFunction"
              ON "resourceInfo"."lineFunction" = "associatedLineFunction"."id"
            LEFT OUTER JOIN "Users" AS "resource"
              ON "ResourceDealMapping"."userId" = "resource"."id"
            LEFT OUTER JOIN "Stages" AS "stage"
              ON "ResourceDealMapping"."dealStageId" = "stage"."id"
            WHERE ${whereClauseString}
          ) AS subquery;
        `;

      const countResult = await sequelize.query(countQuery, {
        type: Sequelize.QueryTypes.SELECT,
        replacements
      });

      const totalRecords = parseInt(countResult[0].count, 10);
      const totalPages = Math.ceil(totalRecords / limit);
      const pagination = {
        totalRecords,
        currentPage: page,
        totalPages,
        pageSize: limit
      };

      // Return data with pagination if records exist
      if (resources.length > 0) {
        return { data: resources, ...pagination };
      } else {
        return { data: resources };
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
