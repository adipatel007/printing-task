const express = require('express');
const router = express.Router();
const brandUsersController = require('../controllers/brandUsersController');
const { auth } = require('../middlewares/auth');

// All routes require authentication so we know userType/brandId
router.use(auth);

router.get('/', brandUsersController.getBrandUsers);
router.post('/', brandUsersController.createBrandUser);
router.put('/:id', brandUsersController.updateBrandUser);
router.delete('/:id', brandUsersController.deleteBrandUser);

module.exports = router;
