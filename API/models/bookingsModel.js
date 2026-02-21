const db = require('../config/db');

const Bookings = {
  create: async (data) => {
    const sql = `INSERT INTO bookings (
      hoardingId, customerId, name, company, address, city, state, country, pincode,
      phone, email, notes, totalDays, amount, paymentStatus, startDate, endDate,
      razorpayOrderId, razorpayPaymentId, razorpaySignature, razorpayInvoiceUrl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.hoardingId,
      data.customerId || null,
      data.name,
      data.company || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
      data.pincode || null,
      data.phone || null,
      data.email || null,
      data.notes || null,
      data.totalDays || 0,
      data.amount || 0,
      data.paymentStatus || 'Pending',
      data.startDate,
      data.endDate,
      data.razorpayOrderId || null,
      data.razorpayPaymentId || null,
      data.razorpaySignature || null,
      data.razorpayInvoiceUrl || null
    ];

    const [result] = await db.execute(sql, params);
    return { status: 'success', data: { id: result.insertId } };
  },

  getById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    return { status: 'success', data: rows[0] };
  },

  getAll: async ({ page = 1, limit = 10, search = '', status = '', hoardingId = '' }) => {
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (hoardingId) {
      query += ' AND hoardingId = ?';
      params.push(hoardingId);
    }

    if (status) {
      query += ' AND paymentStatus = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR city LIKE ? OR state LIKE ?)';
      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM bookings WHERE 1=1';
    const countParams = [];

    if (hoardingId) {
      countQuery += ' AND hoardingId = ?';
      countParams.push(hoardingId);
    }

    if (status) {
      countQuery += ' AND paymentStatus = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR city LIKE ? OR state LIKE ?)';
      countParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    const [countRows] = await db.query(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    return {
      status: 'success',
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  },

  update: async (id, data) => {
    const allowed = [
      'hoardingId', 'customerId', 'name', 'company', 'address', 'city', 'state', 'country',
      'pincode', 'phone', 'email', 'notes', 'totalDays', 'amount', 'paymentStatus',
      'startDate', 'endDate', 'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature', 'razorpayInvoiceUrl'
    ];

    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) {
      return { status: 'success', data: { affectedRows: 0 } };
    }

    const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    const [result] = await db.execute(sql, params);
    return { status: 'success', data: result };
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM bookings WHERE id = ?', [id]);
    return { status: 'success', data: result };
  },

  updateStatus: async (id, paymentStatus) => {
    const [result] = await db.execute('UPDATE bookings SET paymentStatus = ? WHERE id = ?', [paymentStatus, id]);
    return { status: 'success', data: result };
  }
};

module.exports = Bookings;
