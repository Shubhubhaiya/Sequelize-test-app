'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TherapeuticArea extends Model {
    static associate(models) {
      TherapeuticArea.hasMany(models.Deal, {
        foreignKey: 'therapeuticArea',
        as: 'deals'
      });
      TherapeuticArea.belongsToMany(models.User, {
        through: models.UserTherapeuticAreas,
        foreignKey: 'therapeuticAreaId',
        as: 'users'
      });
    }
  }

  TherapeuticArea.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'TherapeuticArea',
      timestamps: true
    }
  );

  return TherapeuticArea;
};
