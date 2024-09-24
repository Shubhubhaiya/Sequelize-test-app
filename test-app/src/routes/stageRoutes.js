const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const validatePagination = require('../middleware/validatePagination');

// Get stages list
router.get('/', validatePagination, stageController.getList);

module.exports = router;
