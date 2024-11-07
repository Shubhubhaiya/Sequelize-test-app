const { AuditTrail } = require('../database/models');

async function createAuditTrailEntry(auditData) {
  setImmediate(async () => {
    try {
      await AuditTrail.create(auditData);
    } catch (error) {
      console.error('Audit trail logging failed:', error);
    }
  });
}

module.exports = { createAuditTrailEntry };
