'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {}
  }
  RolePermission.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      }
    },
    {
      sequelize,
      modelName: 'RolePermission',
      timestamps: false
    }
  );
  return RolePermission;
};
