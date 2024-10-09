const {
  DealWiseResourceInfo,
  ResourceDealMapping,
  User,
  Stage,
  Deal,
  LineFunction,
  DealLeadMapping,
  sequelize
} = require('../database/models');
const apiResponse = require('../utils/apiResponse');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');
const roles = require('../config/roles');
const { Op } = require('sequelize');

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
          where: { email: { [Op.iLike]: email } }
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
}

module.exports = new ResourceService();
