'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Deals', [
      {
        name: 'Brighton',
        currentStage: 1,
        therapeuticArea: 1,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'Arogon',
        currentStage: 1,
        therapeuticArea: 2,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'Candy',
        currentStage: 2,
        therapeuticArea: 1,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'Caledonia',
        currentStage: 4,
        therapeuticArea: 4,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'CHIMAY',
        currentStage: 2,
        therapeuticArea: 2,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'MUNICH',
        currentStage: 3,
        therapeuticArea: 3,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'Traingle',
        currentStage: 1,
        therapeuticArea: 2,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'BANFF',
        currentStage: 4,
        therapeuticArea: 4,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'BANF',
        currentStage: 3,
        therapeuticArea: 3,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'FD_Team',
        currentStage: 1,
        therapeuticArea: 1,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'DOMINOS',
        currentStage: 3,
        therapeuticArea: 2,
        createdBy: 1,
        modifiedBy: 1
      },
      {
        name: 'HDFF',
        currentStage: 3,
        therapeuticArea: 3,
        createdBy: 1,
        modifiedBy: 1
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Deals', null, {});
  }
};
