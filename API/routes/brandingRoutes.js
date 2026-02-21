const express = require('express');
const router = express.Router();
const brandsController = require('../controllers/brandsController');

// Public branding endpoint for all panels
router.get('/:brandCode', brandsController.getBrandingByCode);

module.exports = router;
