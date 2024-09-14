// seeders/20230101-create-roles.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Roles',
      [
        { name: 'SystemAdmin' },
        { name: 'DealLead' },
        { name: 'Resource' } // Assuming Resource has no login capability and no permissions.
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
