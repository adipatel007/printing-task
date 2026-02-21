const express = require('express');
const router = express.Router();
const hoardingsController = require('../controllers/hoardingsController');
const { auth } = require('../middlewares/auth');

// Admin routes (auth required)
router.get('/', hoardingsController.getAllHoardings);
router.get('/:id', hoardingsController.getHordingById);
router.post('/', auth, hoardingsController.createHording);
router.put('/:id', auth, hoardingsController.updateHording);
router.delete('/:id', auth, hoardingsController.deleteHording);

module.exports = router;
