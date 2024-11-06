'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Drop the existing composite primary key on 'userId', 'dealId', and 'dealStageId'
    await queryInterface.removeConstraint(
      'ResourceDealMapping',
      'ResourceDealMapping_pkey'
    );

    // Step 2: Add the 'id' column with auto-increment
    await queryInterface.addColumn('ResourceDealMapping', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false
    });

    // Step 3: Set 'id' as the primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE "ResourceDealMapping" 
      ADD PRIMARY KEY ("id");
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert Step 3: Drop 'id' as primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE "ResourceDealMapping"
      DROP CONSTRAINT "ResourceDealMapping_pkey";
    `);

    // Revert Step 2: Remove the 'id' column
    await queryInterface.removeColumn('ResourceDealMapping', 'id');

    // Revert Step 1: Re-add the composite primary key on 'userId', 'dealId', and 'dealStageId'
    await queryInterface.addConstraint('ResourceDealMapping', {
      fields: ['userId', 'dealId', 'dealStageId'],
      type: 'primary key',
      name: 'ResourceDealMapping_pkey'
    });
  }
};
