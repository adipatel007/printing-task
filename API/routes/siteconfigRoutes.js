const express = require('express');
const router = express.Router();
const SiteconfigsController = require('../controllers/siteconfigController');
const { auth } = require('../middlewares/auth.js');

// Public route - no authentication required
router.get('/getSiteconfig', SiteconfigsController.getSiteconfigByAuth);

// Authenticated routes
router.use(auth);
router.post('/createSiteconfig', SiteconfigsController.createSiteconfigByAuth);
router.put('/updateSiteconfig/:id', SiteconfigsController.updateSiteconfigByAuth);
router.delete('/deleteSiteconfig/:id', SiteconfigsController.deleteSiteconfigByAuth);

module.exports = router;