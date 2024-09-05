const express = require('express');
const router = express.Router();

// Import individual route files
const stageRoutes = require('./stageRoutes');
const userRoutes = require('./userRoutes');

// Use the imported route files

router.use('/stages', stageRoutes);
router.use('/users', userRoutes);

// Export the consolidated router
module.exports = router;
