const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const validateAddResourceSchema = require('../middleware/validateAddResourceRequest');

// Add resource to a deal
router.post('/add', validateAddResourceSchema, resourceController.addResource);

module.exports = router;
