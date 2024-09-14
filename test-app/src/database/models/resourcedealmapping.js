'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResourceDealMapping extends Model {
    static associate(models) {
      ResourceDealMapping.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'resource'
      });

      ResourceDealMapping.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });

      ResourceDealMapping.belongsTo(models.Stage, {
        foreignKey: 'dealStageId',
        as: 'stage'
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'ResourceDealMapping',
      timestamps: false
    }
  );

  return ResourceDealMapping;
};
