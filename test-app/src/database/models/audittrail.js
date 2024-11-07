'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditTrail extends Model {
    static associate(models) {
      AuditTrail.belongsTo(models.User, {
        foreignKey: 'performedBy',
        as: 'user'
      });
      AuditTrail.belongsTo(models.Deal, {
        foreignKey: 'dealId',
        as: 'deal'
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
      //The type of entity, e.g., 'Deal' or 'Resource'.
      entityType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      //'ID of the entity, such as Deal or Resource ID'
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      //reference to the related deal ID.
      dealId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      // Action performed, e.g., 'Created', 'Updated', 'Deleted'

      action: {
        type: DataTypes.STRING,
        allowNull: false
      },

      //The specific field that was changed, if applicable

      fieldChanged: {
        type: DataTypes.STRING,
        allowNull: true
      },

      //Previous value of the field before the update

      oldValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },

      //New value of the field after the update

      newValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      //  Detailed description of the action performed

      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // Timestamp of when the action was performed

      actionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      // ID of the user who performed the action'

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
