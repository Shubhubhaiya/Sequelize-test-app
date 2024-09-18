'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RolePermissions', {
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        }
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Permissions',
          key: 'id'
        }
      }
    });

    // Define a composite primary key if you want to ensure unique combinations
    await queryInterface.addConstraint('RolePermissions', {
      fields: ['roleId', 'permissionId'],
      type: 'primary key',
      name: 'pk_role_permissions'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RolePermissions');
  }
};
