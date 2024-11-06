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

      DealLeadMapping.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      DealLeadMapping.belongsTo(models.User, {
        foreignKey: 'modifiedBy',
        as: 'modifier'
      });
    }
  }

  DealLeadMapping.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      dealId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Deals',
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
      modelName: 'DealLeadMapping',
      tableName: 'DealLeadMapping',
      timestamps: true,
      updatedAt: 'modifiedAt'
    }
  );

  return DealLeadMapping;
};
