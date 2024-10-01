const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
// const validateAddResourceSchema = require('../middleware/validateAddResource');
const multer = require('multer');

const upload = multer();

// Add resource to a deal (either single record or from an Excel file)
router.post(
  '/add',
  upload.single('file'),
  // validateAddResourceSchema,
  resourceController.addResource
);

module.exports = router;
