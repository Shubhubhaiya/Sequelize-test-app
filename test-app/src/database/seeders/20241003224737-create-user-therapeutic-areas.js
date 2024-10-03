'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('UserTherapeuticAreas', [
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        therapeuticAreaId: 1 // Assign to Therapeutic Area 1
      },

      {
        userId: 2,
        therapeuticAreaId: 2
      },

      {
        userId: 2,
        therapeuticAreaId: 3
      },
      {
        userId: 2,
        therapeuticAreaId: 4
      },
      {
        userId: 3, // Shubhdeep Verma (Deal Lead)
        therapeuticAreaId: 1 // Assign to Therapeutic Area 2
      },
      {
        userId: 3,
        therapeuticAreaId: 2
      },
      {
        userId: 3,
        therapeuticAreaId: 3
      },
      {
        userId: 3,
        therapeuticAreaId: 4
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserTherapeuticAreas', null, {});
  }
};
