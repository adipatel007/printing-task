const db = require('../config/db');

exports.getPaymentSettings = async (req, res) => {
  try {
    const [settings] = await db.execute('SELECT * FROM payment_settings LIMIT 1');
    res.status(200).json({
      status: 'success',
      data: settings[0] || null
    });
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePaymentSettings = async (req, res) => {
  try {
    const { isRazorpayEnabled, razorpayKeyId, razorpayKeySecret } = req.body;

    // Check if settings exist
    const [existing] = await db.execute('SELECT id FROM payment_settings LIMIT 1');

    let result;
    if (existing && existing.length > 0) {
      // Update existing settings
      result = await db.execute(
        'UPDATE payment_settings SET isRazorpayEnabled = ?, razorpayKeyId = ?, razorpayKeySecret = ? WHERE id = ?',
        [isRazorpayEnabled ? 1 : 0, razorpayKeyId || '', razorpayKeySecret || '', existing[0].id]
      );
    } else {
      // Insert new settings
      result = await db.execute(
        'INSERT INTO payment_settings (isRazorpayEnabled, razorpayKeyId, razorpayKeySecret) VALUES (?, ?, ?)',
        [isRazorpayEnabled ? 1 : 0, razorpayKeyId || '', razorpayKeySecret || '']
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating payment settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
