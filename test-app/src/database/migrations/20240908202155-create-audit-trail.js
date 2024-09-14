'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuditTrail', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      actionDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      performedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AuditTrail');
  }
};
