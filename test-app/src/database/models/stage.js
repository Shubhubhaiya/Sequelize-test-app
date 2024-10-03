'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Stage extends Model {
    static associate(models) {
      Stage.hasMany(models.Deal, {
        foreignKey: 'currentStage',
        as: 'deals'
      });
    }
  }

  Stage.init(
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
      modelName: 'Stage',
      timestamps: true,
      updatedAt: 'modifiedAt'
    }
  );

  return Stage;
};
