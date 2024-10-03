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
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: false
      },
      therapeuticAreaId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'TherapeuticAreas',
          key: 'id'
        },
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'UserTherapeuticAreas',
      timestamps: true,
      updatedAt: 'modifiedAt',
      indexes: [
        {
          unique: true, // Ensures combination of userId and therapeuticAreaId is unique
          fields: ['userId', 'therapeuticAreaId']
        }
      ]
    }
  );

  return UserTherapeuticAreas;
};
