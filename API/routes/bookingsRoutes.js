const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { auth } = require('../middlewares/auth');

// Public: create booking (customer flow)
router.post('/', bookingsController.createBooking);

// Admin (auth required)
router.get('/', bookingsController.getAllBookings);
router.get('/:id', auth, bookingsController.getBookingById);
router.put('/:id', auth, bookingsController.updateBooking);
router.delete('/:id', auth, bookingsController.deleteBooking);
router.patch('/:id/status', auth, bookingsController.updateBookingStatus);

module.exports = router;