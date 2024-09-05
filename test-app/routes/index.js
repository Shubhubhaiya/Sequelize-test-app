const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');

// Use the imported route files

router.use('/stages', stageRoutes);

// Export the consolidated router
module.exports = router;
