const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const validatePagination = require('../middleware/paginationValidation');

// Route to get all stages
router.get('/', validatePagination, stageController.getList);

module.exports = router;
