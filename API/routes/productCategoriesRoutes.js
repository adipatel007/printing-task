const express = require('express');
const router = express.Router();
const productCategoriesController = require('../controllers/productCategoriesController');
const { auth } = require('../middlewares/auth');

router.get('/', productCategoriesController.getAllCategories);

router.get('/:id', auth, productCategoriesController.getCategoryById);

router.post('/', auth, productCategoriesController.createCategory);

router.put('/:id', auth, productCategoriesController.updateCategory);

router.delete('/:id', auth, productCategoriesController.deleteCategory);

router.patch('/:id/status', auth, productCategoriesController.updateCategoryStatus);

module.exports = router;