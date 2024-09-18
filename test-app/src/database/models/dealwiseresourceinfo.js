'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DealWiseResourceInfo extends Model {
    static associate(models) {
      // A DealWiseResourceInfo belongs to a Deal
      DealWiseResourceInfo.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });

      // A DealWiseResourceInfo belongs to a User
      DealWiseResourceInfo.belongsTo(models.User, {
        foreignKey: 'resourceId',
        as: 'resource'
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
      vdrAccessRequested: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'DealWiseResourceInfo',
      tableName: 'DealWiseResourceInfo',
      timestamps: false
    }
  );

  return DealWiseResourceInfo;
};
