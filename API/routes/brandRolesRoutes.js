const express = require('express');
const router = express.Router();
const brandRolesController = require('../controllers/brandRolesController');
const { auth } = require('../middlewares/auth');
const { superAdminOnly } = require('../middlewares/superAdminOnly');

router.get('/', auth, superAdminOnly, brandRolesController.getAllBrandRoles);
router.get('/brand/:brandId', auth, superAdminOnly, brandRolesController.getBrandRolesByBrand);
router.get('/:id', auth, superAdminOnly, brandRolesController.getBrandRoleById);
router.post('/', auth, superAdminOnly, brandRolesController.createBrandRole);
router.put('/:id', auth, superAdminOnly, brandRolesController.updateBrandRole);
router.delete('/:id', auth, superAdminOnly, brandRolesController.deleteBrandRole);

module.exports = router;
