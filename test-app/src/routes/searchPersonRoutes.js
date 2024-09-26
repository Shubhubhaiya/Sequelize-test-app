const express = require('express');
const searchPersonController = require('../controllers/searchPersonController');
const router = express.Router();

// Get all line functions
router.get('/', searchPersonController.searchPerson);

module.exports = router;
