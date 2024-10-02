'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserTherapeuticAreas', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      therapeuticAreaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TherapeuticAreas',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      modifiedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Define a composite primary key if you want to ensure unique combinations
    await queryInterface.addConstraint('UserTherapeuticAreas', {
      fields: ['userId', 'therapeuticAreaId'],
      type: 'primary key',
      name: 'pk_user_therapeutic_areas'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserTherapeuticAreas');
  }
};
