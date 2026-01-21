const express = require('express');
const router = express.Router();
const brandPermissionsController = require('../controllers/brandPermissionsController');
const { auth } = require('../middlewares/auth');

// All routes require authentication and will filter by brandId from auth token
router.use(auth);

// Get permissions for a specific role (only if role belongs to logged-in user's brand)
router.get('/role/:roleId', brandPermissionsController.getPermissionsByRoleByAuth);

// Bulk update permissions for a role (only if role belongs to logged-in user's brand)
router.post('/bulk', brandPermissionsController.bulkUpdatePermissionsByAuth);

module.exports = router;
