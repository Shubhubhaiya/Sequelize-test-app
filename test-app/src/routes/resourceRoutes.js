const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Add resource to a deal
router.post('/add', resourceController.addResource);

module.exports = router;
