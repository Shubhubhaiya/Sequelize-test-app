const express = require('express');
const router = express.Router();
const therapeuticAreasController = require('../controllers/therapeuticAreasController');

// Route to get all stages
router.get('/', therapeuticAreasController.getList);
router.post('/assign', therapeuticAreasController.assignTherapeuticArea);

module.exports = router;
