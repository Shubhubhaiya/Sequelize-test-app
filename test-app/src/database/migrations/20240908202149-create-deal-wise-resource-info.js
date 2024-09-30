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
        allowNull: false
      },
      webTrainingStatus: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isCoreTeamMember: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      lineFunction: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LineFunctions',
          key: 'id'
        }
      },
      oneToOneDiscussion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      optionalColumn: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DealWiseResourceInfo');
  }
};
