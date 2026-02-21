const express = require('express');
const router = express.Router();
const customerAddressesController = require('../controllers/customerAddressesController');

// Customer routes (customerId passed in body/params)
// Get all addresses for a customer (customerId in query params)
router.get('/', customerAddressesController.getAddresses);

// Get single address by ID
router.get('/:id', customerAddressesController.getAddressById);

// Create new address (customerId in body)
router.post('/', customerAddressesController.createAddress);

// Update address by ID
router.put('/:id', customerAddressesController.updateAddress);

// Delete address by ID
router.delete('/:id', customerAddressesController.deleteAddress);

// Set default address
router.patch('/:id/set-default', customerAddressesController.setDefaultAddress);

module.exports = router;
