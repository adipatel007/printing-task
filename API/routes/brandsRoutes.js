const express = require('express');
const router = express.Router();
const brandsController = require('../controllers/brandsController');
const { auth } = require('../middlewares/auth.js');

function superAdminOnly(req, res, next) {
    if (req.userDetails?.type !== 'Super Administrator User') {
        return res.status(403).json({ error: 'Forbidden: Super Admin only' });
    }
    next();
}

// Super Admin protected routes
router.post('/createBrand', auth, superAdminOnly, brandsController.createBrand);
router.get('/getAllBrands', auth, superAdminOnly, brandsController.getAllBrands);
router.get('/getBrand/:id', auth, superAdminOnly, brandsController.getBrandById);
router.put('/updateBrand/:id', auth, superAdminOnly, brandsController.updateBrand);
router.put('/updateBrandStatus/:id', auth, superAdminOnly, brandsController.updateBrandStatus);
router.delete('/deleteBrand/:id', auth, superAdminOnly, brandsController.deleteBrand);

// Public branding endpoint for all panels
router.get('/branding/:brandCode', brandsController.getBrandingByCode);

module.exports = router;