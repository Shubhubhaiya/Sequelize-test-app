'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add an index on the isDeleted column
    await queryInterface.addIndex('DealLeadMapping', ['isDeleted'], {
      name: 'idx_dealLeadMapping_isDeleted'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index on the isDeleted column
    await queryInterface.removeIndex(
      'DealLeadMapping',
      'idx_dealLeadMapping_isDeleted'
    );
  }
};
