const express = require('express');
const router = express.Router();
const aboutUsController = require('../controllers/aboutUsController');
const { auth } = require('../middlewares/auth');

// Public routes for CUSTOMER
router.get('/', aboutUsController.getAllAboutUs);

// Admin routes with auth
router.get('/:id', auth, aboutUsController.getAboutUsById);
router.post('/', auth, aboutUsController.createAboutUs);
router.put('/:id', auth, aboutUsController.updateAboutUs);
router.delete('/:id', auth, aboutUsController.deleteAboutUs);
router.patch('/:id/status', auth, aboutUsController.updateAboutUsStatus);

module.exports = router;
