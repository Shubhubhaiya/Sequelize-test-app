// seeders/20230103-create-role-permissions.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Roles";`
    );
    const permissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Permissions";`
    );

    const roleMap = new Map(roles[0].map((role) => [role.name, role.id]));
    const permissionMap = new Map(
      permissions[0].map((permission) => [permission.name, permission.id])
    );

    await queryInterface.bulkInsert(
      'RolePermissions',
      [
        // System Admin gets all permissions
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('create_deal')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('update_deal')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('delete_deal')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('view_deal')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('add_resource')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('edit_resource')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('delete_resource')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('view_resource')
        },
        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('assign_therapeutic_area')
        },

        {
          roleId: roleMap.get('SystemAdmin'),
          permissionId: permissionMap.get('onboard_deal_lead')
        },

        // Deal Lead gets specific permissions
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('create_deal')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('update_deal')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('delete_deal')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('view_deal')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('add_resource')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('edit_resource')
        },
        {
          roleId: roleMap.get('DealLead'),
          permissionId: permissionMap.get('view_resource')
        }
        // Note: 'Resource' role does not get permissions explicitly
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
