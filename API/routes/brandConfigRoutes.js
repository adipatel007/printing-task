const express = require('express');
const router = express.Router();
const BrandConfigController = require('../controllers/brandConfigController');
const { auth } = require('../middlewares/auth.js');

// All routes require authentication and will filter by brandId from auth token
router.use(auth);

router.get('/getBrandConfig', BrandConfigController.getBrandConfigByAuth);
router.put('/updateBrandConfig', BrandConfigController.updateBrandConfigByAuth);

module.exports = router;
