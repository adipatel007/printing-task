const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { auth } = require('../middlewares/auth');

// Public routes (no auth)
router.get('/public', productsController.getPublicProducts);
router.get('/public/category/:categoryId', productsController.getProductsByCategory);
router.get('/public/:id', productsController.getPublicProductById);

// Admin routes (auth required)
router.post('/', auth, productsController.createProduct);
router.get('/', auth, productsController.getAllProducts);
router.get('/:id', auth, productsController.getProductById);
router.put('/:id', auth, productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);
router.patch('/:id/status', auth, productsController.updateProductStatus);

module.exports = router;