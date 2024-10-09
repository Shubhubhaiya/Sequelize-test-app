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

      // A User has many DealWiseResourceInfo records (a user can participate in multiple deals)
      User.hasMany(models.DealWiseResourceInfo, {
        foreignKey: 'resourceId',
        as: 'dealWiseResourceInfo'
      });

      // A User can be mapped to multiple stages via ResourceDealMapping
      User.hasMany(models.ResourceDealMapping, {
        foreignKey: 'userId',
        as: 'resourceMappings'
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
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/im // Regex for validating international phone numbers
        }
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[A-Z]{2}$/ // Regex for validating ISO country code (2-letter code)
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
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedAt: {
        allowNull: false,
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
