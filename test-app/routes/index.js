const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');
const lineFunctionsRoutes = require('./lineFunctionRoutes');

// Use the imported route files
router.use('/stages', stageRoutes);
router.use('/line-functions', lineFunctionsRoutes);

// Export the consolidated router
module.exports = router;
