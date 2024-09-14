'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A User belongs to a Role
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });

      // A User belongs to a LineFunction
      User.belongsTo(models.LineFunction, {
        foreignKey: 'lineFunction',
        as: 'associatedLineFunction'
      });

      // A User can be created by another User (Self-referencing)
      User.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      // A User can create many Deals
      User.hasMany(models.Deal, {
        foreignKey: 'createdBy',
        as: 'createdDeals'
      });

      // A User can modify many Deals
      User.hasMany(models.Deal, {
        foreignKey: 'modifiedBy',
        as: 'modifiedDeals'
      });

      // A User can be associated with many TherapeuticAreas (Many-to-Many relationship through UserTherapeuticAreas)
      User.belongsToMany(models.TherapeuticArea, {
        through: models.UserTherapeuticAreas,
        foreignKey: 'userId',
        as: 'therapeuticAreas'
      });

      // A User can be associated with many Deals as a resource (Many-to-Many relationship through ResourceDealMapping)
      User.belongsToMany(models.Deal, {
        through: models.ResourceDealMapping,
        foreignKey: 'userId',
        as: 'resourceDeals'
      });

      // A User can be associated with many Deals as a lead (Many-to-Many relationship through DealLeadMapping)
      User.belongsToMany(models.Deal, {
        through: models.DealLeadMapping,
        foreignKey: 'userId',
        as: 'leadDeals'
      });

      // User modified by another user
      User.belongsTo(models.User, {
        foreignKey: 'modifiedBy',
        as: 'modifier'
      });

      // A User can have many AuditTrail entries (One-to-Many relationship)
      User.hasMany(models.AuditTrail, {
        foreignKey: 'performedBy',
        as: 'auditTrails'
      });
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lineFunction: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'LineFunctions',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },

      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/im // Regex for validating international phone numbers
        }
      },
      siteCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      novartis521ID: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      oneToOneDiscussion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      optionalColumn: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      webTrainingStatus: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isCoreTeamMember: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedAt: {
        allowNull: true,
        type: DataTypes.DATE
      },
      modifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      updatedAt: 'modifiedAt',
      createdAt: 'createdAt'
    }
  );

  return User;
};
