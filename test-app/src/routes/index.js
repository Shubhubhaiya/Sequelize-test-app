const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');
const lineFunctionsRoutes = require('./lineFunctionRoutes');
const therapeuticAreasRoutes = require('./therapeuticAreasRoutes');
const dealRoutes = require('./dealRoutes');

// Use the imported route files
router.use('/stages', stageRoutes);
router.use('/line-functions', lineFunctionsRoutes);
router.use('/therapeutic-areas', therapeuticAreasRoutes);
router.use('/deals', dealRoutes);

// Export the consolidated router
module.exports = router;
