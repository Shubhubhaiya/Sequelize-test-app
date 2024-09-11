const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');

// Route to get all stages
router.get('/', therapeuticAreasController.getList);

module.exports = router;
