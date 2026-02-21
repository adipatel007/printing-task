const Bookings = require('../models/bookingsModel');
const db = require('../config/db');

function isValidDateString(val) {
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
}

exports.getAllBookings = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, status = '', hoardingId = '' } = req.query;

    const results = await Bookings.getAll({
      search,
      page: Number(page),
      limit: Number(limit),
      status,
      hoardingId
    });

    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Bookings.getById(id);

    if (!result.data) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      hoardingId,
      customerId,
      name,
      company,
      address,
      city,
      state,
      country,
      pincode,
      phone,
      email,
      notes,
      totalDays,
      amount,
      paymentStatus,
      startDate,
      endDate
    } = req.body;

    if (!hoardingId || !name || !startDate || !endDate) {
      return res.status(400).json({ error: 'hoardingId, name, startDate and endDate are required' });
    }

    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      return res.status(400).json({ error: 'Invalid startDate or endDate' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'endDate must be greater than or equal to startDate' });
    }

    // Ensure hoarding exists
    const [hRows] = await db.execute('SELECT id, price FROM hoardings WHERE id = ?', [hoardingId]);
    if (!hRows || hRows.length === 0) {
      return res.status(400).json({ error: 'Invalid hoardingId' });
    }

    // If totalDays/amount not provided, compute from dates and price
    const diffTime = end.getTime() - start.getTime();
    const computedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const hoardingPrice = Number(hRows[0].price || 0);
    const computedAmount = computedDays * hoardingPrice;

    const finalTotalDays = totalDays ? Number(totalDays) : computedDays;
    const finalAmount = amount ? Number(amount) : computedAmount;

    if (finalTotalDays < 1) {
      return res.status(400).json({ error: 'totalDays must be at least 1' });
    }

    const result = await Bookings.create({
      hoardingId: Number(hoardingId),
      customerId: customerId ? Number(customerId) : null,
      name,
      company,
      address,
      city,
      state,
      country,
      pincode,
      phone,
      email,
      notes,
      totalDays: finalTotalDays,
      amount: finalAmount,
      paymentStatus: paymentStatus || 'Pending',
      startDate,
      endDate
    });

    return res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Bookings.getById(id);
    if (!existing.data) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const result = await Bookings.update(id, req.body || {});
    if (result.data?.affectedRows === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking updated successfully'
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Bookings.getById(id);
    if (!existing.data) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await Bookings.delete(id);
    return res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['Pending', 'Paid', 'Cancelled'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'paymentStatus must be Pending, Paid, or Cancelled' });
    }

    const existing = await Bookings.getById(id);
    if (!existing.data) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await Bookings.updateStatus(id, paymentStatus);
    return res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully'
    });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
