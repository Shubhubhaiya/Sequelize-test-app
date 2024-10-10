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

      // Build raw SQL where conditions for the count query
      let whereConditions = `"ResourceDealMapping"."isDeleted" = false`;

      // Apply dealId filter if provided
      if (dealId) {
        whereClause.dealId = dealId;
        whereConditions += ` AND "ResourceDealMapping"."dealId" = ${dealId}`;
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
          required: true
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

      // Apply filters
      if (filters) {
        // Filter by line function
        if (filters.lineFunction && filters.lineFunction.length) {
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

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resourceInfo"."lineFunction" IN (${filters.lineFunction.join(',')})`;
        }

        // Filter by stages
        if (filters.stage && filters.stage.length) {
          whereClause.dealStageId = { [Sequelize.Op.in]: filters.stage };
          // Add to raw whereConditions for count query
          whereConditions += ` AND "ResourceDealMapping"."dealStageId" IN (${filters.stage.join(',')})`;
        }

        // Filter by name
        if (filters.name) {
          const nameFilter = filters.name.replace(/'/g, "''"); // Escape single quotes
          const resourceInclude = include.find((inc) => inc.as === 'resource');
          if (resourceInclude) {
            resourceInclude.where = {
              ...resourceInclude.where,
              [Sequelize.Op.or]: [
                {
                  firstName: { [Sequelize.Op.iLike]: `%${filters.name}%` }
                },
                {
                  lastName: { [Sequelize.Op.iLike]: `%${filters.name}%` }
                },
                Sequelize.where(
                  Sequelize.fn(
                    'concat',
                    Sequelize.col('resource.firstName'),
                    ' ',
                    Sequelize.col('resource.lastName')
                  ),
                  {
                    [Sequelize.Op.iLike]: `%${filters.name}%`
                  }
                )
              ]
            };
            resourceInclude.required = true;
          }

          // Add to raw whereConditions for count query
          whereConditions += ` AND (("resource"."firstName" ILIKE '%${nameFilter}%') OR ("resource"."lastName" ILIKE '%${nameFilter}%') OR ("resource"."firstName" || ' ' || "resource"."lastName" ILIKE '%${nameFilter}%'))`;
        }

        // Filter by email
        if (filters.email) {
          const emailFilter = filters.email.replace(/'/g, "''"); // Escape single quotes
          const resourceInclude = include.find((inc) => inc.as === 'resource');
          if (resourceInclude) {
            resourceInclude.where = {
              ...resourceInclude.where,
              email: { [Sequelize.Op.iLike]: `%${filters.email}%` }
            };
            resourceInclude.required = true;
          }

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resource"."email" ILIKE '%${emailFilter}%'`;
        }

        // Filter by VDR Access Requested
        if (filters.vdrAccessRequested !== undefined) {
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

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resourceInfo"."vdrAccessRequested" = ${filters.vdrAccessRequested}`;
        }

        // Filter by Web Training Status
        if (filters.webTrainingStatus && filters.webTrainingStatus.length) {
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

          // Add to raw whereConditions for count query
          const statuses = filters.webTrainingStatus.map(
            (status) => `'${status.replace(/'/g, "''")}'`
          );
          whereConditions += ` AND "resourceInfo"."webTrainingStatus" IN (${statuses.join(',')})`;
        }

        // Additional filters for title, novartis521ID, etc.
        if (filters.title) {
          const titleFilter = filters.title.replace(/'/g, "''"); // Escape single quotes
          const resourceInclude = include.find((inc) => inc.as === 'resource');
          if (resourceInclude) {
            resourceInclude.where = {
              ...resourceInclude.where,
              title: { [Sequelize.Op.iLike]: `%${filters.title}%` }
            };
            resourceInclude.required = true;
          }

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resource"."title" ILIKE '%${titleFilter}%'`;
        }

        if (filters.novartis521ID) {
          const idFilter = filters.novartis521ID.replace(/'/g, "''"); // Escape single quotes
          const resourceInclude = include.find((inc) => inc.as === 'resource');
          if (resourceInclude) {
            resourceInclude.where = {
              ...resourceInclude.where,
              novartis521ID: {
                [Sequelize.Op.iLike]: `%${filters.novartis521ID}%`
              }
            };
            resourceInclude.required = true;
          }

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resource"."novartis521ID" ILIKE '%${idFilter}%'`;
        }

        if (filters.isCoreTeamMember !== undefined) {
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

          // Add to raw whereConditions for count query
          whereConditions += ` AND "resourceInfo"."isCoreTeamMember" = ${filters.isCoreTeamMember}`;
        }
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

      // Count Query
      const countQuery = `
        SELECT COUNT(*) FROM (
          SELECT DISTINCT "ResourceDealMapping"."userId", "ResourceDealMapping"."dealId", "ResourceDealMapping"."dealStageId"
          FROM "ResourceDealMapping"
          INNER JOIN "DealWiseResourceInfo" AS "resourceInfo"
            ON "ResourceDealMapping"."dealId" = "resourceInfo"."dealId"
          LEFT OUTER JOIN "LineFunctions" AS "associatedLineFunction"
            ON "resourceInfo"."lineFunction" = "associatedLineFunction"."id"
          LEFT OUTER JOIN "Users" AS "resource"
            ON "ResourceDealMapping"."userId" = "resource"."id"
          LEFT OUTER JOIN "Stages" AS "stage"
            ON "ResourceDealMapping"."dealStageId" = "stage"."id"
          WHERE ${whereConditions}
        ) AS subquery;
      `;

      const countResult = await sequelize.query(countQuery, {
        type: Sequelize.QueryTypes.SELECT
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
      return {
        data: resources,
        pagination
      };
    } catch (error) {
      console.error(error);
      errorHandler.handle(error); // Replace with your actual error handler
    }
  }
}

module.exports = new ResourceService();
