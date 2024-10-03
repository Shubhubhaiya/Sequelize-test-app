'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Deal extends Model {
    static associate(models) {
      // A Deal belongs to a Stage
      Deal.belongsTo(models.Stage, {
        foreignKey: 'currentStage',
        as: 'stage'
      });

      // A Deal belongs to a TherapeuticArea
      Deal.belongsTo(models.TherapeuticArea, {
        foreignKey: 'therapeuticArea',
        as: 'therapeuticAreaAssociation'
      });

      // A Deal is created by a User
      Deal.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      // A Deal is modified by a User
      Deal.belongsTo(models.User, {
        foreignKey: 'modifiedBy',
        as: 'modifier'
      });

      // A Deal can have many resources (Many-to-Many relationship with Users through ResourceDealMapping)
      Deal.belongsToMany(models.User, {
        through: models.ResourceDealMapping,
        foreignKey: 'dealId',
        as: 'resourceUsers'
      });

      // A Deal can have many lead users (Many-to-Many relationship with Users through DealLeadMapping)
      Deal.belongsToMany(models.User, {
        through: models.DealLeadMapping,
        foreignKey: 'dealId',
        as: 'leadUsers'
      });

      // A Deal can have many entries in DealWiseResourceInfo (One-to-Many relationship)
      Deal.hasMany(models.DealWiseResourceInfo, {
        foreignKey: 'dealId',
        as: 'resourceInfo'
      });
    }
  }

  Deal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      currentStage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Stages',
          key: 'id'
        }
      },
      therapeuticArea: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TherapeuticAreas',
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
      modelName: 'Deal',
      timestamps: true,
      updatedAt: 'modifiedAt'
    }
  );

  return Deal;
};
