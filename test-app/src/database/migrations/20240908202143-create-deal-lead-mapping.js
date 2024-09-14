'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DealLeadMapping', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      dealId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DealLeadMapping');
  }
};
