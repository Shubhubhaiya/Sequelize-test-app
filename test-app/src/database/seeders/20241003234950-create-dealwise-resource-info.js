'use strict';

const { webTrainingStatus } = require('../../config/webTrainingStatus');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('DealWiseResourceInfo', [
      {
        dealId: 1, // Brighton
        resourceId: 5, // Aditya Mantha (Resource)
        lineFunction: 1,
        vdrAccessRequested: true,
        webTrainingStatus: webTrainingStatus.IN_PROGRESS,
        oneToOneDiscussion: 'Discussion ongoing about the project scope.',
        optionalColumn: null,
        isCoreTeamMember: true,
        createdBy: 1, // System Admin
        modifiedBy: 1,
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        dealId: 1, // Brighton
        resourceId: 6, // Deepthi Konjeti (Resource)
        lineFunction: 2,
        vdrAccessRequested: false,
        webTrainingStatus: webTrainingStatus.NOT_STARTED,
        oneToOneDiscussion: null,
        optionalColumn: 'Additional responsibilities will be assigned later.',
        isCoreTeamMember: false,
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        dealId: 2, // Arogon
        resourceId: 7, // Biswajit Sahoo (Resource)
        lineFunction: 3,
        vdrAccessRequested: true,
        webTrainingStatus: webTrainingStatus.COMPLETED,
        oneToOneDiscussion:
          'Discussion completed on finalizing the requirements.',
        optionalColumn: 'Expert in CRM and related functions.',
        isCoreTeamMember: true,
        createdBy: 1,
        modifiedBy: 1,
        createdAt: new Date(),
        modifiedAt: new Date()
      },
      {
        dealId: 3, // Candy
        resourceId: 5, // Aditya Mantha (Resource)
        lineFunction: 1,
        vdrAccessRequested: false,
        webTrainingStatus: webTrainingStatus.NOT_STARTED,
        oneToOneDiscussion: 'Initial briefing scheduled for next week.',
        optionalColumn: null,
        isCoreTeamMember: false,
        createdBy: 1,
        modifiedBy: 1,
        createdAt: new Date(),
        modifiedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('DealWiseResourceInfo', null, {});
  }
};
