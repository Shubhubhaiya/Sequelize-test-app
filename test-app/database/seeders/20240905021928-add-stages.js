'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Stages',
      [
        {
          name: 'Initiation',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Planning',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Execution',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Monitoring and Controlling',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Closure',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: Implement logic to undo the seed here, if necessary
    return queryInterface.bulkDelete('Stages', null, {});
  }
};
