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
    const { userId, dealId, filters } = body;
    const { page = 1, limit = 10 } = query;

    try {
      const offset = (page - 1) * limit;

      // Build where clause for ResourceDealMapping
      const whereClause = { isDeleted: false };

      // Initialize replacements object for parameterized queries
      const replacements = {};

      // Initialize whereConditions as an array
      const whereConditions = [`"ResourceDealMapping"."isDeleted" = false`];

      // Apply dealId filter if provided
      if (dealId) {
        whereClause.dealId = dealId;
        whereConditions.push(`"ResourceDealMapping"."dealId" = :dealId`);
        replacements.dealId = dealId;
      }

      // Initial includes
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
                Sequelize.col('resourceInfo.resourceId')
              ),
              Sequelize.where(
                Sequelize.col('ResourceDealMapping.dealId'),
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

      // Apply filters if filters object is provided
      if (filters) {
        // Filter by line function
        if (filters.lineFunction && filters.lineFunction.length > 0) {
          const resourceInfoInclude = include.find(
            (inc) => inc.as === 'resourceInfo'
          );
          if (resourceInfoInclude) {
            resourceInfoInclude.where = {
              ...resourceInfoInclude.where,
              lineFunction: {
                [Sequelize.Op.in]: filters.lineFunction
              }
            };
            resourceInfoInclude.required = true;
          }

          // Add to whereConditions for count query
          whereConditions.push(
            `"resourceInfo"."lineFunction" IN (:lineFunctions)`
          );
          replacements.lineFunctions = filters.lineFunction;
        }

        // Filter by stages
        if (filters.stage && filters.stage.length > 0) {
          whereClause.dealStageId = { [Sequelize.Op.in]: filters.stage };

          // Add to whereConditions for count query
          whereConditions.push(
            `"ResourceDealMapping"."dealStageId" IN (:stages)`
          );
          replacements.stages = filters.stage;
        }

        // Filter by name
        if (filters.name) {
          const nameFilter = filters.name;
          if (nameFilter !== '') {
            const resourceInclude = include.find(
              (inc) => inc.as === 'resource'
            );
            if (resourceInclude) {
              resourceInclude.where = {
                ...resourceInclude.where,
                [Sequelize.Op.or]: [
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
                ]
              };
              resourceInclude.required = true;
            }

            // Add to whereConditions for count query
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
            const resourceInclude = include.find(
              (inc) => inc.as === 'resource'
            );
            if (resourceInclude) {
              resourceInclude.where = {
                ...resourceInclude.where,
                email: { [Sequelize.Op.iLike]: `%${emailFilter}%` }
              };
              resourceInclude.required = true;
            }

            // Add to whereConditions for count query
            whereConditions.push(`"resource"."email" ILIKE :emailFilter`);
            replacements.emailFilter = `%${emailFilter}%`;
          }
        }

        // Filter by VDR Access Requested (boolean)
        if (
          filters.vdrAccessRequested !== null &&
          filters.vdrAccessRequested !== undefined
        ) {
          const resourceInfoInclude = include.find(
            (inc) => inc.as === 'resourceInfo'
          );
          if (resourceInfoInclude) {
            resourceInfoInclude.where = {
              ...resourceInfoInclude.where,
              vdrAccessRequested: filters.vdrAccessRequested
            };
            resourceInfoInclude.required = true;
          }

          // Add to whereConditions for count query
          whereConditions.push(
            `"resourceInfo"."vdrAccessRequested" = :vdrAccessRequested`
          );
          replacements.vdrAccessRequested = filters.vdrAccessRequested;
        }

        // Filter by Web Training Status
        if (filters.webTrainingStatus && filters.webTrainingStatus.length > 0) {
          const resourceInfoInclude = include.find(
            (inc) => inc.as === 'resourceInfo'
          );
          if (resourceInfoInclude) {
            resourceInfoInclude.where = {
              ...resourceInfoInclude.where,
              webTrainingStatus: {
                [Sequelize.Op.in]: filters.webTrainingStatus
              }
            };
            resourceInfoInclude.required = true;
          }

          // Add to whereConditions for count query
          whereConditions.push(
            `"resourceInfo"."webTrainingStatus" IN (:webTrainingStatuses)`
          );
          replacements.webTrainingStatuses = filters.webTrainingStatus;
        }

        // Additional filters for title, novartis521ID, etc.
        if (filters.title) {
          const titleFilter = filters.title;
          if (titleFilter !== '') {
            const resourceInclude = include.find(
              (inc) => inc.as === 'resource'
            );
            if (resourceInclude) {
              resourceInclude.where = {
                ...resourceInclude.where,
                title: { [Sequelize.Op.iLike]: `%${titleFilter}%` }
              };
              resourceInclude.required = true;
            }

            // Add to whereConditions for count query
            whereConditions.push(`"resource"."title" ILIKE :titleFilter`);
            replacements.titleFilter = `%${titleFilter}%`;
          }
        }

        if (filters.novartis521ID) {
          const idFilter = filters.novartis521ID;
          if (idFilter !== '') {
            const resourceInclude = include.find(
              (inc) => inc.as === 'resource'
            );
            if (resourceInclude) {
              resourceInclude.where = {
                ...resourceInclude.where,
                novartis521ID: {
                  [Sequelize.Op.iLike]: `%${idFilter}%`
                }
              };
              resourceInclude.required = true;
            }

            // Add to whereConditions for count query
            whereConditions.push(
              `"resource"."novartis521ID" ILIKE :novartis521IDFilter`
            );
            replacements.novartis521IDFilter = `%${idFilter}%`;
          }
        }

        // Filter by isCoreTeamMember (boolean)
        if (
          filters.isCoreTeamMember !== null &&
          filters.isCoreTeamMember !== undefined
        ) {
          const resourceInfoInclude = include.find(
            (inc) => inc.as === 'resourceInfo'
          );
          if (resourceInfoInclude) {
            resourceInfoInclude.where = {
              ...resourceInfoInclude.where,
              isCoreTeamMember: filters.isCoreTeamMember
            };
            resourceInfoInclude.required = true;
          }

          // Add to whereConditions for count query
          whereConditions.push(
            `"resourceInfo"."isCoreTeamMember" = :isCoreTeamMember`
          );
          replacements.isCoreTeamMember = filters.isCoreTeamMember;
        }

        // Additional filters can be added here following the same pattern
      }

      // Sorting
      const order = [
        ['userId', 'ASC'],
        ['dealId', 'ASC'],
        ['dealStageId', 'ASC'],
        ['modifiedAt', 'DESC']
      ];

      // Data Query
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

      // Build response data
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

      // Join where conditions for the count query
      const whereClauseString = whereConditions.join(' AND ');

      // Count Query using parameterized inputs
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

      // Pagination
      const totalPages = Math.ceil(totalRecords / limit);
      const pagination = {
        totalRecords,
        currentPage: page,
        totalPages,
        pageSize: limit
      };

      // Return the response

      if (resources.length > 0) {
        return { data: resources, pagination };
      } else {
        return {
          data: resources
        };
      }
    } catch (error) {
      console.error(error);
      errorHandler.handle(error);
    }
  }
}

module.exports = new ResourceService();
