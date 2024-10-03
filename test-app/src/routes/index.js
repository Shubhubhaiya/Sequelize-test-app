const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');
const lineFunctionsRoutes = require('./lineFunctionRoutes');
const therapeuticAreasRoutes = require('./therapeuticAreasRoutes');
const dealRoutes = require('./dealRoutes');
const searchPersonRoutes = require('./searchPersonRoutes');
const resourceRoutes = require('./resourceRoutes');

// Use the imported route files
router.use('/stages', stageRoutes);
router.use('/line-functions', lineFunctionsRoutes);
router.use('/therapeutic-areas', therapeuticAreasRoutes);
router.use('/deals', dealRoutes);
router.use('/search-person', searchPersonRoutes);
router.use('/resources', resourceRoutes);

// Export the consolidated router
module.exports = router;
