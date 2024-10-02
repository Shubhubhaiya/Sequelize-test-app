'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.Role, {
        through: 'RolePermissions',
        as: 'roles',
        foreignKey: 'permissionId',
        otherKey: 'roleId'
      });
    }
  }

  Permission.init(
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
      modelName: 'Permission',
      timestamps: true
    }
  );

  return Permission;
};
