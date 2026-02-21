const express = require('express');
const router = express.Router();
const {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    updateBannerStatus
} = require('../controllers/bannersController');

const { auth } = require('../middlewares/auth');

router.get('/', getAllBanners);

router.get('/:id', auth, getBannerById);

router.post('/', auth, createBanner);

router.put('/:id', auth, updateBanner);

router.delete('/:id', auth, deleteBanner);

router.patch('/:id/status', auth, updateBannerStatus);

module.exports = router;