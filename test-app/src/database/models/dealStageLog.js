'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DealStageLog extends Model {
    static associate(models) {
      DealStageLog.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
      });
      DealStageLog.belongsTo(models.Stage, {
        foreignKey: 'stageId',
        as: 'stage'
      });
    }
  }

  DealStageLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      dealId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      stageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stages',
          key: 'id'
        }
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'DealStageLog',
      timestamps: true,
      updatedAt: modifiedAt
    }
  );

  return DealStageLog;
};
