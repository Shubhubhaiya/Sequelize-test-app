// seeders/20230102-create-permissions.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Permissions',
      [
        { name: 'create_deal' },
        { name: 'update_deal' },
        { name: 'delete_deal' },
        { name: 'view_deal' },
        { name: 'add_resource' },
        { name: 'edit_resource' },
        { name: 'delete_resource' },
        { name: 'view_resource' },
        { name: 'assign_therapeutic_area' },
        { name: 'onboard_deal_lead' }
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
