'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LineFunction extends Model {
    static associate(models) {
      // LineFunction can be associated with many Users through DealWiseResourceInfo
      LineFunction.belongsToMany(models.User, {
        through: models.DealWiseResourceInfo,
        foreignKey: 'lineFunction',
        otherKey: 'resourceId',
        as: 'resources'
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
      timestamps: true
    }
  );

  return LineFunction;
};
