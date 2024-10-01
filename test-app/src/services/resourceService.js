const {
  DealWiseResourceInfo,
  ResourceDealMapping,
  User,
  sequelize
} = require('../database/models');
const baseService = require('./baseService');
const apiResponse = require('../utils/apiResponse');
const errorHandler = require('../utils/errorHandler');
const CustomError = require('../utils/customError');
const statusCodes = require('../config/statusCodes');
const roles = require('../config/roles'); // Assuming roles are defined in a config file

class ResourceService extends baseService {
  constructor() {
    super(DealWiseResourceInfo);
  }

  async addResource(data, userId, isBatch = false) {
    let transaction;
    try {
      transaction = await sequelize.transaction();

      const records = isBatch ? data : [data];

      // Insert or update resource details in User table
      const resourceIds = [];

      for (const record of records) {
        const {
          email,
          firstName,
          lastName,
          title,
          phone,
          countryCode,
          siteCode,
          novartis521ID
        } = record;

        // Check if resource already exists in User table by email or novartis521ID
        let user = await User.findOne({ where: { email } });

        if (!user) {
          // Insert new resource into User table
          user = await User.create(
            {
              email,
              firstName,
              lastName,
              title,
              phone,
              countryCode,
              siteCode,
              novartis521ID,
              roleId: roles.RESOURCE, // Assuming the roleId for a resource
              createdBy: userId
            },
            { transaction }
          );
        } else {
          // Update existing resource details
          await user.update(
            {
              firstName,
              lastName,
              title,
              phone,
              countryCode,
              siteCode,
              novartis521ID,
              modifiedBy: userId
            },
            { transaction }
          );
        }

        resourceIds.push(user.id);
      }

      // Insert or update resource data in DealWiseResourceInfo table using resourceIds
      for (let index = 0; index < records.length; index++) {
        const record = records[index];
        const resourceId = resourceIds[index];
        const existingResourceInfo = await DealWiseResourceInfo.findOne({
          where: { dealId: record.dealId, resourceId }
        });

        if (existingResourceInfo) {
          // Update existing DealWiseResourceInfo record
          await existingResourceInfo.update(
            {
              lineFunction: record.lineFunction,
              vdrAccessRequested: record.vdrAccessRequested,
              webTrainingStatus: record.webTrainingStatus,
              oneToOneDiscussion: record.oneToOneDiscussion,
              optionalColumn: record.optionalColumn,
              isCoreTeamMember: record.isCoreTeamMember,
              modifiedBy: userId
            },
            { transaction }
          );
        } else {
          // Insert new DealWiseResourceInfo record
          await DealWiseResourceInfo.create(
            {
              dealId: record.dealId,
              resourceId,
              lineFunction: record.lineFunction,
              vdrAccessRequested: record.vdrAccessRequested,
              webTrainingStatus: record.webTrainingStatus,
              oneToOneDiscussion: record.oneToOneDiscussion,
              optionalColumn: record.optionalColumn,
              isCoreTeamMember: record.isCoreTeamMember,
              createdBy: userId
            },
            { transaction }
          );
        }
      }

      // Insert or update resource mapping with stages in ResourceDealMapping
      for (let index = 0; index < records.length; index++) {
        const { dealId, stages } = records[index];
        const resourceId = resourceIds[index];

        for (const stageId of stages) {
          const existingMapping = await ResourceDealMapping.findOne({
            where: {
              userId: resourceId,
              dealId,
              dealStageId: stageId
            }
          });

          if (existingMapping) {
            // Update isDeleted to false if it was previously deleted
            if (existingMapping.isDeleted) {
              await existingMapping.update(
                { isDeleted: false },
                { transaction }
              );
            }
          } else {
            // Insert new mapping
            await ResourceDealMapping.create(
              {
                userId: resourceId,
                dealId,
                dealStageId: stageId,
                isDeleted: false
              },
              { transaction }
            );
          }
        }
      }

      await transaction.commit();

      return apiResponse.success(null, null, 'Resources added successfully');
    } catch (error) {
      if (transaction) await transaction.rollback();
      errorHandler.handle(error);
    }
  }
}

module.exports = new ResourceService();
