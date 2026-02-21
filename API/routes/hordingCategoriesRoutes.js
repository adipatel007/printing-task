const express = require('express');
const router = express.Router();
const hordingCategoriesController = require('../controllers/hordingCategoriesController');
const { auth } = require('../middlewares/auth');

// Admin routes (auth required)
router.get('/', hordingCategoriesController.getAllHordingCategories);
router.get('/:id', auth, hordingCategoriesController.getHordingCategoryById);
router.post('/', auth, hordingCategoriesController.createHordingCategory);
router.put('/:id', auth, hordingCategoriesController.updateHordingCategory);
router.delete('/:id', auth, hordingCategoriesController.deleteHordingCategory);

module.exports = router;
