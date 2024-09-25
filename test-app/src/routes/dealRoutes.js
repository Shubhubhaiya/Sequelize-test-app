const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const validateCreateDealSchema = require('../middleware/validateDeal');
const validateRouteId = require('../middleware/validateRouteId');
const validateDeleteDealRequestSchema = require('../middleware/validateDeleteDealRequest');

// create deal

router.post('/create', validateCreateDealSchema, dealController.createDeal);

// update deal

router.put(
  '/:id',
  validateRouteId,
  validateCreateDealSchema,
  dealController.updateDeal
);

// delete deal

router.delete(
  '/:id',
  validateDeleteDealRequestSchema,
  dealController.deleteDeal
);

// deal detail

router.get('/:id', validateRouteId, dealController.getDealDetail);

// deal list

router.post('/list', dealController.getDealsList);

module.exports = router;
