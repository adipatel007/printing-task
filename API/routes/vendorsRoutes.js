const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendorsController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, vendorsController.createVendor);
router.get('/', auth, vendorsController.getAllVendors);
router.get('/paginated', auth, vendorsController.getAllVendorsByPage);
router.get('/:id', auth, vendorsController.getVendorById);
router.put('/:id', auth, vendorsController.updateVendor);
router.delete('/:id', auth, vendorsController.deleteVendor);

module.exports = router;
