'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users'
      });
      Role.belongsToMany(models.Permission, {
        through: 'RolePermissions',
        as: 'permissions',
        foreignKey: 'roleId',
        otherKey: 'permissionId'
      });
    }
  }

  Role.init(
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
      modelName: 'Role',
      timestamps: true
    }
  );

  return Role;
};
