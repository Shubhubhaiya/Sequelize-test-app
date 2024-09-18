'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Deals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      currentStage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Stages',
          key: 'id'
        }
      },
      therapeuticArea: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TherapeuticAreas',
          key: 'id'
        }
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
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      modifiedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Deals');
  }
};
