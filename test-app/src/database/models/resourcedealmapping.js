'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResourceDealMapping extends Model {
    static associate(models) {
      // A ResourceDealMapping belongs to DealWiseResourceInfo by dealId
      ResourceDealMapping.belongsTo(models.DealWiseResourceInfo, {
        foreignKey: 'dealId',
        as: 'resourceInfo'
      });

      // A ResourceDealMapping belongs to a Deal
      ResourceDealMapping.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });

      // A ResourceDealMapping belongs to a Stage
      ResourceDealMapping.belongsTo(models.Stage, {
        foreignKey: 'dealStageId',
        as: 'stage'
      });

      // A ResourceDealMapping belongs to a User (resource)
      ResourceDealMapping.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'resource'
      });

      // A ResourceDealMapping can be created by a User (creator)
      ResourceDealMapping.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      // A ResourceDealMapping can be modified by a User (modifier)
      ResourceDealMapping.belongsTo(models.User, {
        foreignKey: 'modifiedBy',
        as: 'modifier'
      });
    }
  }

  ResourceDealMapping.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      dealId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      dealStageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Stages',
          key: 'id'
        }
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
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'ResourceDealMapping',
      tableName: 'ResourceDealMapping',
      timestamps: true,
      updatedAt: 'modifiedAt'
    }
  );

  return ResourceDealMapping;
};
