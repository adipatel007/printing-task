const express = require('express');
const router = express.Router();
const razorpayService = require('../services/razorpayService');
const Bookings = require('../models/bookingsModel');

// Create Razorpay order for booking
router.post('/create-order',  async (req, res) => {
  try {
    const { amount, bookingData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }

    const receipt = `booking_${Date.now()}`;
    const order = await razorpayService.createOrder(amount, receipt, {
      hoardingId: bookingData?.hoardingId,
      customerId: bookingData?.customerId
    });

    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create order'
    });
  }
});

// Verify payment and create booking
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingData } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing payment details'
      });
    }

    // Verify payment signature
    const isValid = await razorpayService.verifyPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature);

    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment signature'
      });
    }

    // Generate invoice URL
    const invoiceUrl = razorpayService.generateInvoiceUrl(bookingData.hoardingId, razorpayPaymentId);

    // Create booking with Razorpay details
    const bookingResult = await Bookings.create({
      ...bookingData,
      paymentStatus: 'Paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      razorpayInvoiceUrl: invoiceUrl
    });

    res.json({
      status: 'success',
      message: 'Payment verified and booking created successfully',
      data: bookingResult.data
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to verify payment'
    });
  }
});

module.exports = router;
