const express = require('express');
const router = express.Router();
const productTypesController = require('../controllers/productTypesController');
const { auth } = require('../middlewares/auth');

// Get all product types with pagination and search
router.get('/', auth, productTypesController.getAllProductTypes);

// Get product type by ID
router.get('/:id', auth, productTypesController.getProductTypeById);

// Create new product type
router.post('/', auth, productTypesController.createProductType);

// Update product type
router.put('/:id', auth, productTypesController.updateProductType);

// Delete product type
router.delete('/:id', auth, productTypesController.deleteProductType);

// Update product type status
router.patch('/:id/status', auth, productTypesController.updateProductTypeStatus);

module.exports = router;
