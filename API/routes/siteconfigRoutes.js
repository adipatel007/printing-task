const express = require('express');
const router = express.Router();
const SiteconfigsController = require('../controllers/siteconfigController');
const { auth } = require('../middlewares/auth.js');

// All routes require authentication and will filter by brandId from auth token
router.use(auth);

router.post('/createSiteconfig', SiteconfigsController.createSiteconfigByAuth);
router.get('/getSiteconfig', SiteconfigsController.getSiteconfigByAuth);
router.put('/updateSiteconfig/:id', SiteconfigsController.updateSiteconfigByAuth);
router.delete('/deleteSiteconfig/:id', SiteconfigsController.deleteSiteconfigByAuth);

module.exports = router;