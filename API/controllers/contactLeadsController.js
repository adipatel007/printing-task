const db = require('../config/db');

exports.createContactLead = async (req, res) => {
  try {
    const { name, email, phone, subject, message, brandCode } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Name, email, phone, and message are required' });
    }

    const [result] = await db.query(
      `INSERT INTO contact_leads (name, email, phone, subject, message, brandCode, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())`,
      [name, email, phone, subject || null, message, brandCode || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Contact lead created successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creating contact lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllContactLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', brandCode } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contact_leads WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (brandCode) {
      query += ' AND brandCode = ?';
      params.push(brandCode);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [leads] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact_leads WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (brandCode) {
      countQuery += ' AND brandCode = ?';
      countParams.push(brandCode);
    }

    const [count] = await db.query(countQuery, countParams);

    res.status(200).json({
      status: 'success',
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching contact leads:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getContactLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const [leads] = await db.query(
      'SELECT * FROM contact_leads WHERE id = ?',
      [id]
    );

    if (!leads.length) {
      return res.status(404).json({ error: 'Contact lead not found' });
    }

    res.status(200).json({
      status: 'success',
      data: leads[0]
    });
  } catch (err) {
    console.error('Error fetching contact lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateContactLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const [result] = await db.query(
      'UPDATE contact_leads SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact lead not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact lead status updated successfully'
    });
  } catch (err) {
    console.error('Error updating contact lead status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteContactLead = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM contact_leads WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact lead not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact lead deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting contact lead:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
