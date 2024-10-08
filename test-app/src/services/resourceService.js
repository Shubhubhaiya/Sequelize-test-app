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
const baseService = require('./baseService');

class ResourceService extends baseService {
  constructor() {
    super(ResourceDealMapping);
  }
  async addResource(dealId, userId, resources) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      // Fetch the user adding the resources and validate their role
      const currentUser = await User.findByPk(userId);
      if (!currentUser) {
        throw new CustomError('User not found', statusCodes.NOT_FOUND);
      }

      // Deal Lead can only add resources to deals they lead
      if (currentUser.roleId === roles.DEAL_LEAD) {
        const dealLeadMapping = await DealLeadMapping.findOne({
          where: { userId: currentUser.id, dealId, isDeleted: false }
        });
        if (!dealLeadMapping) {
          throw new CustomError(
            'Deal Leads can only add resources to their own deals',
            statusCodes.UNAUTHORIZED
          );
        }
      }

      // Validate if the deal exists and is not deleted
      const deal = await Deal.findOne({
        where: { id: dealId, isDeleted: false }
      });
      if (!deal) {
        throw new CustomError('Deal not found', statusCodes.NOT_FOUND);
      }

      for (const resource of resources) {
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
        const lineFunctionExists = await LineFunction.findByPk(lineFunction);
        if (!lineFunctionExists) {
          throw new CustomError(
            `Line Function with ID ${lineFunction} not found`,
            statusCodes.BAD_REQUEST
          );
        }

        // Validate stages
        const validStages = await Stage.findAll({ where: { id: stages } });
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
          where: { email: { [Sequelize.Op.iLike]: email } }
        });

        if (!user) {
          throw new CustomError(
            `Resource with this email {resource.email} not found!`,
            statusCodes.BAD_REQUEST
          );
          // Search user from active directory
          // If found insert user record into our database
          // user = await User.create(
          //   {
          //     email,
          //     roleId: roles.RESOURCE,
          //     createdBy: userId
          //   },
          //   { transaction }
          // );
        }

        // Insert or update resource data in DealWiseResourceInfo table
        const existingResourceInfo = await DealWiseResourceInfo.findOne({
          where: { dealId, resourceId: user.id }
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
            { transaction }
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
            { transaction }
          );
        }

        // Insert or update resource mapping with stages in ResourceDealMapping
        for (const stageId of stages) {
          const existingMapping = await ResourceDealMapping.findOne({
            where: { userId: user.id, dealId, dealStageId: stageId }
          });

          if (existingMapping) {
            if (existingMapping.isDeleted) {
              await existingMapping.update(
                { isDeleted: false, modifiedBy: userId },
                { transaction }
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
              { transaction }
            );
          }
        }
      }

      await transaction.commit();
      return apiResponse.success(null, null, 'Resource(s) added successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }

  async getResourceList(query, body) {
    const { dealId, filters } = body;
    const { page = 1, limit = 10 } = query;

    try {
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
      if (filters) {
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

        // Filter by Web Training Status
        if (filters.webTrainingStatus && filters.webTrainingStatus.length > 0) {
          resourceInfoWhere.webTrainingStatus = {
            [Sequelize.Op.in]: filters.webTrainingStatus
          };
          whereConditions.push(
            `"resourceInfo"."webTrainingStatus" IN (:webTrainingStatuses)`
          );
          replacements.webTrainingStatuses = filters.webTrainingStatus;
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
        const resources = data.map((resourceDeal) => ({
          id: resourceDeal.userId,
          lineFunction: {
            id: resourceDeal.resourceInfo?.associatedLineFunction?.id,
            name: resourceDeal.resourceInfo?.associatedLineFunction?.name
          },
          name: `${resourceDeal.resource?.firstName} ${resourceDeal.resource?.lastName}`,
          stage: {
            id: resourceDeal.stage?.id,
            name: resourceDeal.stage?.name
          },
          title: resourceDeal.resource?.title,
          email: resourceDeal.resource?.email,
          vdrAccessRequested: resourceDeal.resourceInfo?.vdrAccessRequested,
          webTrainingStatus: resourceDeal.resourceInfo?.webTrainingStatus,
          novartis521ID: resourceDeal.resource?.novartis521ID,
          isCoreTeamMember: resourceDeal.resourceInfo?.isCoreTeamMember,
          oneToOneDiscussion: resourceDeal.resourceInfo?.oneToOneDiscussion,
          optionalColumn: resourceDeal.resourceInfo?.optionalColumn,
          siteCode: resourceDeal.resource?.siteCode
        }));

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
          return { data: resources, pagination };
        } else {
          return { data: resources };
        }
      }
    } catch (error) {
      console.error(error);
      errorHandler.handle(error);
    }
  }
}

module.exports = new ResourceService();
