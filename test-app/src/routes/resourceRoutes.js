const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const validateAddResourceSchema = require('../middleware/validateAddResourceRequest');
const validateResourceListSchema = require('../middleware/validateResourceListRequest');
const validateDeleteResourceSchema = require('../middleware/validateDeleteResourceRequest');
const validateResourceDetailSchema = require('../middleware/validateResourceDetailRequest');
const validateUpdateResourceSchema = require('../middleware/validateUpdateResourceRequest');

// Add resource to a deal
router.post('/add', validateAddResourceSchema, resourceController.addResource);

// List all resources of deal
router.post(
  '/list',
  validateResourceListSchema,
  resourceController.listResources
);

// Get resource detail from deal
router.get(
  '/detail',
  validateResourceDetailSchema,
  resourceController.getResourceDetail
);

//  Delete resource from particular stage of a deal
router.delete(
  '/:resourceId/stage/:stageId/deal/:dealId',
  validateDeleteResourceSchema,
  resourceController.deleteResource
);

// Route for updating resource in a deal stage
router.put(
  '/update',
  validateUpdateResourceSchema,
  resourceController.updateResource
);

module.exports = router;
