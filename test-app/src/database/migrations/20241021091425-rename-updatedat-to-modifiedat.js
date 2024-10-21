'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renaming the column 'updatedAt' to 'modifiedAt' in the DealStageLogs table
    await queryInterface.renameColumn(
      'DealStageLogs',
      'updatedAt',
      'modifiedAt'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting the column rename from 'modifiedAt' to 'updatedAt'
    await queryInterface.renameColumn(
      'DealStageLogs',
      'modifiedAt',
      'updatedAt'
    );
  }
};
