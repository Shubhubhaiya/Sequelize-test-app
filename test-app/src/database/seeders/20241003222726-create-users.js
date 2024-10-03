'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Hatakesam',
        lastName: 'Goru',
        title: 'System Admin',
        email: 'Hatakesam.goru@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Hatakesam@novartis.net',
        roleId: 1 // for system admin
      },

      {
        firstName: 'Ravi',
        lastName: 'Chaudhary',
        title: 'Deal Lead',
        email: 'Ravi.Chaudhary@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Ravi@novartis.net',
        roleId: 2, // role ID 2 corresponds to Deal Lead
        createdBy: 1,
        modifiedBy: 1
      },

      {
        firstName: 'Shubhdeep',
        lastName: 'verma',
        title: 'Deal Lead',
        email: 'Shubhdeep.Verma@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Shubhdeep@novartis.net',
        roleId: 2,
        createdBy: 1,
        modifiedBy: 1
      },

      {
        firstName: 'Pankaj',
        lastName: 'Singh',
        title: 'Deal Lead',
        email: 'Pankaj.Singh@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Pankaj@novartis.net',
        roleId: 2,
        createdBy: 1,
        modifiedBy: 1
      },

      {
        firstName: 'Aditya',
        lastName: 'Mantha',
        title: 'Resource',
        email: 'Aditya.Mantha@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Aditya@novartis.net',
        roleId: 3, // for resource
        createdBy: 3,
        modifiedBy: 1
      },

      {
        firstName: 'Deepthi',
        lastName: 'Konjeti',
        title: 'Resource',
        email: 'Deepthi.Konjeti@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Deepthi@novartis.net',
        roleId: 3, // for resource
        createdBy: 2,
        modifiedBy: 1
      },
      {
        firstName: 'Biswajit',
        lastName: 'Sahoo',
        title: 'Resource',
        email: 'Biswajit.Sahoo@novartis.com',
        siteCode: 'HQ',
        novartis521ID: 'Biswajit@novartis.net',
        roleId: 3, // for resource
        createdBy: 2,
        modifiedBy: 1
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
