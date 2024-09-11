const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');
const lineFunctionsRoutes = require('./lineFunctionRoutes');
const therapeuticAreasRoutes = require('./therapeuticAreasRoutes');

// Use the imported route files
router.use('/stages', stageRoutes);
router.use('/line-functions', lineFunctionsRoutes);
router.use('/therapeutic-areas', therapeuticAreasRoutes);

// Export the consolidated router
module.exports = router;
