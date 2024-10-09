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

class ResourceService {
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
      // Build where clause for resources mapped to a deal in ResourceDealMapping
      const whereClause = { dealId, isDeleted: false }; // Ensure isDeleted is false in ResourceDealMapping

      const include = [
        {
          model: DealWiseResourceInfo, // Join with DealWiseResourceInfo
          as: 'resourceInfo', // Use the alias defined in the model
          attributes: [
            'vdrAccessRequested',
            'webTrainingStatus',
            'oneToOneDiscussion',
            'optionalColumn',
            'isCoreTeamMember',
            'lineFunction',
            'modifiedAt'
          ], // Include necessary attributes from DealWiseResourceInfo
          include: [
            {
              model: LineFunction,
              as: 'associatedLineFunction',
              attributes: ['id', 'name']
            }
          ],
          required: true // Ensures we only return records where DealWiseResourceInfo exists
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
          whereClause['$resourceInfo.lineFunction$'] = {
            [Sequelize.Op.in]: filters.lineFunction
          };
        }

        // Filter by stages
        if (filters.stage && filters.stage.length) {
          whereClause.dealStageId = { [Sequelize.Op.in]: filters.stage };
        }

        // Filter by name (concatenation of firstName and lastName)
        if (filters.name) {
          include.push({
            model: User,
            as: 'resource',
            where: {
              [Sequelize.Op.or]: [
                Sequelize.where(
                  Sequelize.fn(
                    'concat',
                    Sequelize.col('firstName'),
                    ' ',
                    Sequelize.col('lastName')
                  ),
                  {
                    [Sequelize.Op.iLike]: `%${filters.name}%`
                  }
                )
              ]
            }
          });
        }

        // Filter by email
        if (filters.email) {
          whereClause['$resource.email$'] = {
            [Sequelize.Op.iLike]: `%${filters.email}%`
          };
        }

        // Filter by VDR Access Requested
        if (filters.vdrAccessRequested !== undefined) {
          whereClause['$resourceInfo.vdrAccessRequested$'] =
            filters.vdrAccessRequested;
        }

        // Filter by Web Training Status
        if (filters.webTrainingStatus && filters.webTrainingStatus.length) {
          whereClause['$resourceInfo.webTrainingStatus$'] = {
            [Sequelize.Op.in]: filters.webTrainingStatus
          };
        }

        // Additional filters for title, novartis521ID, etc.
        if (filters.title) {
          whereClause['$resource.title$'] = {
            [Sequelize.Op.iLike]: `%${filters.title}%`
          };
        }

        if (filters.novartis521ID) {
          whereClause['$resource.novartis521ID$'] = {
            [Sequelize.Op.iLike]: `%${filters.novartis521ID}%`
          };
        }

        if (filters.isCoreTeamMember !== undefined) {
          whereClause['$resourceInfo.isCoreTeamMember$'] =
            filters.isCoreTeamMember;
        }
      }

      // Pagination and Sorting
      const offset = (page - 1) * limit;
      const order = [['modifiedAt', 'DESC']];

      // Fetch resources from ResourceDealMapping as the primary source
      const { count, rows } = await ResourceDealMapping.findAndCountAll({
        where: whereClause,
        include,
        offset,
        limit,
        order,
        distinct: true,
        group: [
          'ResourceDealMapping.userId',
          'ResourceDealMapping.dealId',
          'ResourceDealMapping.dealStageId',
          'resource.id',
          'resourceInfo.resourceId',
          'resourceInfo.dealId',
          'resourceInfo.vdrAccessRequested',
          'resourceInfo.webTrainingStatus',
          'resourceInfo.oneToOneDiscussion',
          'resourceInfo.optionalColumn',
          'resourceInfo.isCoreTeamMember',
          'resourceInfo.lineFunction',
          'resourceInfo.modifiedAt',
          'resourceInfo->associatedLineFunction.id',
          'resourceInfo->associatedLineFunction.name',
          'stage.id',
          'stage.name'
        ]
      });

      // Build response data
      const resources = rows.map((resourceDeal) => ({
        id: resourceDeal.userId,
        lineFunction: {
          id: resourceDeal.resourceInfo.associatedLineFunction?.id,
          name: resourceDeal.resourceInfo.associatedLineFunction?.name
        },
        name: `${resourceDeal.resource.firstName} ${resourceDeal.resource.lastName}`,
        stage: {
          id: resourceDeal.stage?.id,
          name: resourceDeal.stage?.name
        },
        title: resourceDeal.resource.title,
        email: resourceDeal.resource.email,
        vdrAccessRequested: resourceDeal.resourceInfo.vdrAccessRequested,
        webTrainingStatus: resourceDeal.resourceInfo.webTrainingStatus,
        novartis521ID: resourceDeal.resource.novartis521ID,
        isCoreTeamMember: resourceDeal.resourceInfo.isCoreTeamMember,
        oneToOneDiscussion: resourceDeal.resourceInfo.oneToOneDiscussion,
        optionalColumn: resourceDeal.resourceInfo.optionalColumn,
        siteCode: resourceDeal.resource.siteCode
      }));

      // Return paginated response
      return {
        data: resources,
        totalRecords: count.length, // count might return an array of grouped counts, ensure we return the right length
        currentPage: page,
        totalPages: Math.ceil(count.length / limit),
        pageSize: limit
      };
    } catch (error) {
      errorHandler.handle(error);
    }
  }
}

module.exports = new ResourceService();
