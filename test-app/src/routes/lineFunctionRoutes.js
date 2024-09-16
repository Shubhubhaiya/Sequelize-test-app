const express = require('express');
const router = express.Router();
const lineFunctionController = require('../controllers/lineFunctionController');
const validatePagination = require('../middleware/paginationValidation');

// Route to get all stages
router.get('/', validatePagination, lineFunctionController.getList);

module.exports = router;
