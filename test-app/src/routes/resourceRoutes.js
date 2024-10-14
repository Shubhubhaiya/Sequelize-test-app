const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const validateAddResourceSchema = require('../middleware/validateAddResourceRequest');
const validateResourceListSchema = require('../middleware/validateResourceListRequest');
const validateDeleteResourceSchema = require('../middleware/validateDeleteResourceRequest');

// Add resource to a deal
router.post('/add', validateAddResourceSchema, resourceController.addResource);

// List all resources of deal
router.post(
  '/list',
  validateResourceListSchema,
  resourceController.listResources
);

// Delete resource from particular stage of a deal
router.delete(
  '/:resourceId/stages/:stageId/deals/:dealId',
  validateDeleteResourceSchema,
  resourceController.deleteResource
);
module.exports = router;
