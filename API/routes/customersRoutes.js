const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { auth } = require('../middlewares/auth');

// Customer public routes
router.post('/login', customersController.customerLogin);
router.post('/register', customersController.customerRegister);
router.get('/exists', customersController.checkExists);

// Admin protected routes
router.post('/', auth, customersController.createCustomer);
router.get('/', auth, customersController.getAllCustomers);
router.get('/paginated', auth, customersController.getAllCustomersByPage);
router.get('/:id', auth, customersController.getCustomerById);
router.put('/:id', auth, customersController.updateCustomer);
router.delete('/:id', auth, customersController.deleteCustomer);

module.exports = router;
