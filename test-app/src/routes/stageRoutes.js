const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');

// Route to get all stages
router.get('/', stageController.getList);

module.exports = router;
