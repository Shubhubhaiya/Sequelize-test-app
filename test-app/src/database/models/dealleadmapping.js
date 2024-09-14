'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DealLeadMapping extends Model {
    static associate(models) {
      DealLeadMapping.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'dealLead'
      });

      DealLeadMapping.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });
    }
  }

  DealLeadMapping.init(
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
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'DealLeadMapping',
      timestamps: false
    }
  );

  return DealLeadMapping;
};
