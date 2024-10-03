'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('ResourceDealMapping', [
      {
        userId: 5, // Aditya Mantha (Resource)
        dealId: 1, // Brighton
        dealStageId: 1, // Initial Stage
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      },
      {
        userId: 6, // Deepthi Konjeti (Resource)
        dealId: 1, // Brighton (same deal, different resource)
        dealStageId: 1, // Initial Stage
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      },
      {
        userId: 7, // Biswajit Sahoo (Resource)
        dealId: 2, // Arogon
        dealStageId: 2,
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      },
      {
        userId: 5, // Aditya Mantha (Resource)
        dealId: 3, // Candy
        dealStageId: 3,
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      },
      {
        userId: 6, // Deepthi Konjeti (Resource)
        dealId: 3, // Candy (same deal, different resource)
        dealStageId: 3,
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      },
      {
        userId: 7, // Biswajit Sahoo (Resource)
        dealId: 4, // Caledonia
        dealStageId: 4,
        createdBy: 1,
        modifiedBy: 1,
        isDeleted: false
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ResourceDealMapping', null, {});
  }
};
