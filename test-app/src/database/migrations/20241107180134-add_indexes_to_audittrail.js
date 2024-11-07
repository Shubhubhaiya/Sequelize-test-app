'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes to the AuditTrail table
    await queryInterface.addIndex('AuditTrail', ['dealId'], {
      name: 'idx_audittrail_dealid'
    });
    await queryInterface.addIndex('AuditTrail', ['actionDate'], {
      name: 'idx_audittrail_actiondate'
    });
    await queryInterface.addIndex('AuditTrail', ['action'], {
      name: 'idx_audittrail_action'
    });
    await queryInterface.addIndex('AuditTrail', ['dealId', 'actionDate'], {
      name: 'idx_audittrail_dealid_actiondate'
    });

    // Add index to the User table for combined firstName and lastName
    await queryInterface.addIndex('Users', ['firstName', 'lastName'], {
      name: 'idx_user_firstname_lastname'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes from the AuditTrail table
    await queryInterface.removeIndex('AuditTrail', 'idx_audittrail_dealid');
    await queryInterface.removeIndex('AuditTrail', 'idx_audittrail_actiondate');
    await queryInterface.removeIndex('AuditTrail', 'idx_audittrail_action');
    await queryInterface.removeIndex(
      'AuditTrail',
      'idx_audittrail_dealid_actiondate'
    );

    // Remove index from the User table
    await queryInterface.removeIndex('Users', 'idx_user_firstname_lastname');
  }
};
