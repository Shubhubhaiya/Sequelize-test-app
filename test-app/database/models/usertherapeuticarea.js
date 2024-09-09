'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserTherapeuticAreas extends Model {
    static associate(models) {
      // No associations as it's a junction table
    }
  }

  UserTherapeuticAreas.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      therapeuticAreaId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'TherapeuticAreas',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'UserTherapeuticAreas',
      timestamps: false
    }
  );

  return UserTherapeuticAreas;
};
