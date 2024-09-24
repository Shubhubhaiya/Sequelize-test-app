const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const validateCreateDealSchema = require('../middleware/validateDeal');

// create deal

router.post('/create', validateCreateDealSchema, dealController.createDeal);

// update deal

router.put('/:id', validateCreateDealSchema, dealController.updateDeal);

// delete deal

router.delete('/:id', dealController.deleteDeal);

// deal detail

router.get('/:id', dealController.getDealDetail);

// deal list

router.post('/list', dealController.getDealsList);

module.exports = router;
