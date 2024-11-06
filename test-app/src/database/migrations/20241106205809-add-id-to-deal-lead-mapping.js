'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add the 'id' column with auto-increment and set it as the new primary key
    await queryInterface.addColumn('DealLeadMapping', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    });

    // Step 4 (optional): Add a non-unique index on 'userId' and 'dealId' for performance
    await queryInterface.addIndex('DealLeadMapping', ['userId', 'dealId'], {
      name: 'idx_userId_dealId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Step 2: Remove the 'id' column
    await queryInterface.removeColumn('DealLeadMapping', 'id');
    // Step 1: Remove the non-unique index on 'userId' and 'dealId'
    await queryInterface.removeIndex('DealLeadMapping', 'idx_userId_dealId');
  }
};
