const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, productsController.createProduct);
router.get('/', auth, productsController.getAllProducts);
router.get('/:id', auth, productsController.getProductById);
router.put('/:id', auth, productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);

module.exports = router;
