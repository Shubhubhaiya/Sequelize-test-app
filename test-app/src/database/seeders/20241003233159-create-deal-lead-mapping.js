'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('DealLeadMapping', [
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        dealId: 1, // Brighton
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 3, // Shubhdeep Verma (Deal Lead)
        dealId: 2, // Arogon
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 4, // Pankaj Singh (Deal Lead)
        dealId: 3, // Candy
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        dealId: 4, // Caledonia
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 3, // Shubhdeep Verma (Deal Lead)
        dealId: 5, // CHIMAY
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 4, // Pankaj Singh (Deal Lead)
        dealId: 6, // MUNICH
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        dealId: 7, // Traingle
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: true
      },
      {
        userId: 3, // Shubhdeep verma (Deal Lead)
        dealId: 7, // Traingle
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 3, // Shubhdeep Verma (Deal Lead)
        dealId: 8, // BANFF
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 4, // Pankaj Singh (Deal Lead)
        dealId: 9, // BANF
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        dealId: 10, // FD_Team
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 3, // Shubhdeep Verma (Deal Lead)
        dealId: 11, // DOMINOS
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: true
      },
      {
        userId: 2, // Ravi Chaudhary (Deal Lead)
        dealId: 11, // DOMINOS
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      },
      {
        userId: 4, // Pankaj Singh (Deal Lead)
        dealId: 12, // HDFF
        createdBy: 1, // System Admin
        modifiedBy: 1, // System Admin
        isDeleted: false
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('DealLeadMapping', null, {});
  }
};
