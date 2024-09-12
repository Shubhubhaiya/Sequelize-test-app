'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RolePermissions', {
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles', // This should match the table name as defined in your Sequelize model
          key: 'id'
        },
        onDelete: 'CASCADE', // Ensures deletion of relationship when Role is deleted
        onUpdate: 'CASCADE'
      },
      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Permissions', // This should match the table name as defined in your Sequelize model
          key: 'id'
        },
        onDelete: 'CASCADE', // Ensures deletion of relationship when Permission is deleted
        onUpdate: 'CASCADE'
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
