'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DealWiseResourceInfo', {
      dealId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Deals',
          key: 'id'
        }
      },
      resourceId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      vdrAccessRequested: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DealWiseResourceInfo');
  }
};
