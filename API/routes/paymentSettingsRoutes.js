const express = require('express');
const router = express.Router();
const paymentSettingsController = require('../controllers/paymentSettingsController');
const { auth } = require('../middlewares/auth');
const razorpayService = require('../services/razorpayService');

// Get payment settings
router.get('/', auth, paymentSettingsController.getPaymentSettings);

// Update payment settings
router.put('/', auth, paymentSettingsController.updatePaymentSettings);

// Get Razorpay credentials (public endpoint for frontend)
router.get('/razorpay-credentials', async (req, res) => {
  try {
    const credentials = await razorpayService.getCredentials();
    res.json({
      status: 'success',
      data: {
        keyId: credentials.keyId
      }
    });
  } catch (error) {
    console.error('Error fetching Razorpay credentials:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Razorpay credentials'
    });
  }
});

module.exports = router;
