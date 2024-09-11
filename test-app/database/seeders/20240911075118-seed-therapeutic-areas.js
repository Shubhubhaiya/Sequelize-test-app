'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'TherapeuticAreas',
      [
        { name: 'CRM' },
        { name: 'IMM' },
        { name: 'NS & GTX' },
        { name: 'ONCO' },
        { name: 'RLT' },
        { name: 'Platform' },
        { name: 'Others' }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TherapeuticAreas', null, {});
  }
};
