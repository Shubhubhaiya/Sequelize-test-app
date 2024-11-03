const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');
const validatePagination = require('../middleware/validatePagination');
const validateAssignTherapeuticAreas = require('../middleware/validateAssignTherapeuticAreas');
const validateUnassignTherapeuticAreas = require('../middleware/validateUnassignTherapeuticArea');

// Get therapeutic areas list
router.get('/', validatePagination, therapeuticAreasController.getList);

// Assign therapeutic area
router.post(
  '/assign',
  validateAssignTherapeuticAreas,
  therapeuticAreasController.assignTherapeuticArea
);

// Unassign therapeutic area
router.post(
  '/unassign',
  validateUnassignTherapeuticAreas,
  therapeuticAreasController.unAssignTherapeuticArea
);

module.exports = router;
