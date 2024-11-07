const express = require('express');
const router = express.Router();
const auditTrailController = require('../controllers/auditTrailController');

// Get stages list
router.post('/', auditTrailController.getList);

module.exports = router;
