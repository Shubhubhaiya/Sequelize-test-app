'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'id' column with auto-increment and set it as the new primary key
    await queryInterface.addColumn('DealLeadMapping', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false
    });

    // Step 3: Set 'id' as the primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE "DealLeadMapping" 
      ADD PRIMARY KEY ("id");
    `);

    // Add a non-unique index on 'userId' and 'dealId' for performance
    await queryInterface.addIndex('DealLeadMapping', ['userId', 'dealId'], {
      name: 'idx_dealLeadMapping_userId_dealId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'id' column
    await queryInterface.removeColumn('DealLeadMapping', 'id');

    // Revert: Drop 'id' as primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE "DealLeadMapping"
      DROP CONSTRAINT "ResourceDealMapping_pkey";
    `);
    // Remove the non-unique index on 'userId' and 'dealId'
    await queryInterface.removeIndex(
      'DealLeadMapping',
      'idx_dealLeadMapping_userId_dealId'
    );
  }
};
