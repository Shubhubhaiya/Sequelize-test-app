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
      lineFunction: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LineFunctions',
          key: 'id'
        }
      },
      vdrAccessRequested: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      webTrainingStatus: {
        type: Sequelize.ENUM('Not Started', 'In-progress', 'completed'),
        allowNull: false
      },
      oneToOneDiscussion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      optionalColumn: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isCoreTeamMember: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      modifiedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DealWiseResourceInfo');
  }
};
