const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');
const validatePagination = require('../middleware/validatePagination');
const validateAssignTherapeuticAreas = require('../middleware/validateAssignTherapeuticAreas');

// Route to get all stages
router.get('/', validatePagination, therapeuticAreasController.getList);
router.post(
  '/assign',
  validateAssignTherapeuticAreas,
  therapeuticAreasController.assignTherapeuticArea
);

module.exports = router;
