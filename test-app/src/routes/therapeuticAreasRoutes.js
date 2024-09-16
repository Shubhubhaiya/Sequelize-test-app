const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');
const validatePagination = require('../middleware/paginationValidation');

// Route to get all stages
router.get('/', validatePagination, therapeuticAreasController.getList);
router.post('/assign', therapeuticAreasController.assignTherapeuticArea);

module.exports = router;
