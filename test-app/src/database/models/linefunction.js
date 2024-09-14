'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LineFunction extends Model {
    static associate(models) {
      LineFunction.hasMany(models.User, {
        foreignKey: 'lineFunction',
        as: 'users'
      });
    }
  }

  LineFunction.init(
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
      modelName: 'LineFunction',
      timestamps: false
    }
  );

  return LineFunction;
};
