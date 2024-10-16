'use strict';
const { Model } = require('sequelize');
const { webTrainingStatus } = require('../../config/webTrainingStatus');

module.exports = (sequelize, DataTypes) => {
  class DealWiseResourceInfo extends Model {
    static associate(models) {
      // A DealWiseResourceInfo belongs to a Deal (Many-to-One relationship)
      DealWiseResourceInfo.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });

      // A DealWiseResourceInfo belongs to a User (Many-to-One relationship)
      DealWiseResourceInfo.belongsTo(models.User, {
        foreignKey: 'resourceId', // This matches 'resourceId' in User model
        as: 'resource' // Alias to clarify the association with User
      });

      // A DealWiseResourceInfo belongs to a LineFunction (Many-to-One relationship)
      DealWiseResourceInfo.belongsTo(models.LineFunction, {
        foreignKey: 'lineFunction',
        as: 'associatedLineFunction' // Changed alias to avoid naming collision
      });

      // A DealWiseResourceInfo can be created by a User (Many-to-One relationship)
      DealWiseResourceInfo.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      // A DealWiseResourceInfo can be modified by a User (Many-to-One relationship)
      DealWiseResourceInfo.belongsTo(models.User, {
        foreignKey: 'modifiedBy',
        as: 'modifier'
      });

      // A DealWiseResourceInfo has many ResourceDealMappings
      DealWiseResourceInfo.hasMany(models.ResourceDealMapping, {
        foreignKey: 'dealId',
        as: 'resourceMappings'
      });
    }
  }

  DealWiseResourceInfo.init(
    {
      dealId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      resourceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      lineFunction: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'LineFunctions',
          key: 'id'
        }
      },
      vdrAccessRequested: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      webTrainingStatus: {
        type: DataTypes.ENUM(
          webTrainingStatus.NOT_STARTED,
          webTrainingStatus.IN_PROGRESS,
          webTrainingStatus.COMPLETED
        ),
        allowNull: false
      },
      oneToOneDiscussion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      optionalColumn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isCoreTeamMember: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'DealWiseResourceInfo',
      tableName: 'DealWiseResourceInfo',
      timestamps: true,
      updatedAt: 'modifiedAt'
    }
  );

  return DealWiseResourceInfo;
};
