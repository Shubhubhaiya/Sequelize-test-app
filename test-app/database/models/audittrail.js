'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditTrail extends Model {
    static associate(models) {
      // An AuditTrail is performed by a User (Many-to-One relationship)
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
        primaryKey: true
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: false
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
      timestamps: false
    }
  );

  return AuditTrail;
};
