'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditTrail extends Model {
    static associate(models) {
      AuditTrail.belongsTo(models.User, {
        foreignKey: 'performedBy',
        as: 'user'
      });
    }
  }

  AuditTrail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      dealId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      actionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      performedBy: {
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
      modelName: 'AuditTrail',
      tableName: 'AuditTrail',
      timestamps: false
    }
  );

  return AuditTrail;
};
