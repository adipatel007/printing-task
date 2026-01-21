const express = require('express');
const router = express.Router();
const superadminUsersController = require('../controllers/superadminUsersController');
const { auth } = require('../middlewares/auth.js');

function superAdminAuth(req, res, next) {
    if (req.userDetails?.type !== 'Super Administrator User') {
        return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }
    next();
}

// Super Admin login (no auth required)
router.post('/loginSuperAdmin', superadminUsersController.loginSuperAdmin);

// Super Admin user management routes (protected)
router.post('/createSuperAdminUser', auth, superAdminAuth, superadminUsersController.createSuperAdminUser);
router.get('/getAllSuperAdminUsers', auth, superAdminAuth, superadminUsersController.getAllSuperAdminUsers);
router.get('/getAllSuperAdminUsersByPage', auth, superAdminAuth, superadminUsersController.getAllSuperAdminUsersByPage);
router.get('/getSuperAdminUser/:id', auth, superAdminAuth, superadminUsersController.getSuperAdminUserById);
router.put('/updateSuperAdminUser/:id', auth, superAdminAuth, superadminUsersController.updateSuperAdminUser);
router.put('/updateSuperAdminUserStatus/:id', auth, superAdminAuth, superadminUsersController.updateSuperAdminUserStatus);
router.delete('/deleteSuperAdminUser/:id', auth, superAdminAuth, superadminUsersController.deleteSuperAdminUser);

module.exports = router;
