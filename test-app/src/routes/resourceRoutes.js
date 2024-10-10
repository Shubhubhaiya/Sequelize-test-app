const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const validateAddResourceSchema = require('../middleware/validateAddResourceRequest');
const validateResourceListSchema = require('../middleware/validateResourceListRequest');

// Add resource to a deal
router.post('/add', validateAddResourceSchema, resourceController.addResource);
router.post(
  '/list',
  validateResourceListSchema,
  resourceController.listResources
);
module.exports = router;
