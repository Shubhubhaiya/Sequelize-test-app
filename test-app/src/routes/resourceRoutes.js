const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Add resource to a deal
router.post('/add', resourceController.addResource);
router.post('/list', resourceController.listResources);
module.exports = router;
