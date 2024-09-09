const express = require('express');
const router = express.Router();
const lineFunctionController = require('../controllers/lineFunctionController');

// Route to get all stages
router.get('/', lineFunctionController.getAllLineFunctions);

module.exports = router;
