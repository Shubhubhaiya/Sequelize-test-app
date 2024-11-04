const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');
const validatePagination = require('../middleware/validatePagination');
const validateAssignTherapeuticAreas = require('../middleware/validateAssignTherapeuticAreas');

// Get therapeutic areas list
router.get('/', validatePagination, therapeuticAreasController.getList);

// Assign therapeutic area
router.post(
  '/assign',
  validateAssignTherapeuticAreas,
  therapeuticAreasController.assignTherapeuticArea
);

module.exports = router;
