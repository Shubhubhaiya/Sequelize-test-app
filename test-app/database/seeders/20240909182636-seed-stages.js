'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Stages',
      [
        { name: 'Triage' },
        { name: 'Focused Diligence' },
        { name: 'Full Assessment' },
        { name: 'Final Negotiation' },
        { name: 'Signed' },
        { name: 'Closed' }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Stages', null, {});
  }
};
