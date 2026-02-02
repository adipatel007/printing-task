const express = require('express');
const router = express.Router();
const brandRolesController = require('../controllers/brandRolesController');
const { auth } = require('../middlewares/auth.js');

// All routes require authentication and will filter by brandId from auth token
router.use(auth);

// Get all roles for the logged-in user's brand
router.get('/getAllRoles', brandRolesController.getBrandRolesByAuth);

// Create a role for the logged-in user's brand
router.post('/createRole', brandRolesController.createBrandRoleByAuth);

// Update a role (only if it belongs to the logged-in user's brand)
router.put('/updateRole/:id', brandRolesController.updateBrandRoleByAuth);

// Delete a role (only if it belongs to the logged-in user's brand)
router.delete('/deleteRole/:id', brandRolesController.deleteBrandRoleByAuth);

module.exports = router;