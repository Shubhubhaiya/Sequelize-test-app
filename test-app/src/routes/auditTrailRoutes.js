const express = require('express');
const router = express.Router();
const auditTrailController = require('../controllers/auditTrailController');
const validateAuditTrailSchema = require('../middleware/validateAuditTrailRequest');

// Get stages list
router.post('/', validateAuditTrailSchema, auditTrailController.getList);

module.exports = router;
