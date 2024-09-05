'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Stages',
      [
        { name: 'Triage', createdAt: new Date(), updatedAt: new Date() },
        {
          name: 'Focused Diligence',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Full Assessment',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Final Negotiation',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { name: 'Signed', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Closed', createdAt: new Date(), updatedAt: new Date() }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Stages', null, {});
  }
};
