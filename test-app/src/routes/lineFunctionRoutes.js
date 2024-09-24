const express = require('express');
const router = express.Router();
const lineFunctionController = require('../controllers/lineFunctionController');
const validatePagination = require('../middleware/validatePagination');

// Get all line functions
router.get('/', validatePagination, lineFunctionController.getList);

module.exports = router;
