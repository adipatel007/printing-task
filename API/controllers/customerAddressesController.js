const db = require('../config/db');

const customerAddressesController = {
  // Get all addresses for a customer
  getAddresses: async (req, res) => {
    try {
      const customerId = req.body.customerId || req.query.customerId;
      if (!customerId) {
        return res.status(400).json({ error: true, message: 'Customer ID required' });
      }

      const query = `
        SELECT id, label, full_name, phone, country, state, city,
               address_line1, address_line2, zip_code, is_default,
               created_at, updated_at
        FROM customer_addresses
        WHERE customer_id = ?
        ORDER BY is_default DESC, created_at DESC
      `;

      const [addresses] = await db.query(query, [customerId]);

      res.json({ error: false, data: addresses });
    } catch (error) {
      console.error('Error getting addresses:', error);
      res.status(500).json({ error: true, message: 'Failed to get addresses' });
    }
  },

  // Get address by ID
  getAddressById: async (req, res) => {
    try {
      const { id } = req.params;

      const query = `
        SELECT id, label, full_name, phone, country, state, city,
               address_line1, address_line2, zip_code, is_default,
               created_at, updated_at
        FROM customer_addresses
        WHERE id = ?
      `;

      const [addresses] = await db.query(query, [id]);

      if (addresses.length === 0) {
        return res.status(404).json({ error: true, message: 'Address not found' });
      }

      res.json({ error: false, data: addresses[0] });
    } catch (error) {
      console.error('Error getting address:', error);
      res.status(500).json({ error: true, message: 'Failed to get address' });
    }
  },

  // Create new address
  createAddress: async (req, res) => {
    try {
      const {
        customerId,
        label,
        fullName,
        phone,
        country,
        state,
        city,
        addressLine1,
        addressLine2,
        zipCode,
        isDefault
      } = req.body;

      if (!customerId || !label || !fullName || !phone || !country || !state || !city || !addressLine1 || !zipCode) {
        return res.status(400).json({ error: true, message: 'All required fields must be provided' });
      }

      // If setting as default, unset other default addresses
      if (isDefault) {
        await db.query(
          'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
          [customerId]
        );
      }

      const query = `
        INSERT INTO customer_addresses
        (customer_id, label, full_name, phone, country, state, city,
         address_line1, address_line2, zip_code, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(query, [
        customerId,
        label,
        fullName,
        phone,
        country,
        state,
        city,
        addressLine1,
        addressLine2 || null,
        zipCode,
        isDefault ? 1 : 0
      ]);

      res.status(201).json({
        error: false,
        message: 'Address created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ error: true, message: 'Failed to create address' });
    }
  },

  // Update address
  updateAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        customerId,
        label,
        fullName,
        phone,
        country,
        state,
        city,
        addressLine1,
        addressLine2,
        zipCode,
        isDefault
      } = req.body;

      if (!label || !fullName || !phone || !country || !state || !city || !addressLine1 || !zipCode) {
        return res.status(400).json({ error: true, message: 'All required fields must be provided' });
      }

      // If setting as default, unset other default addresses
      if (isDefault && customerId) {
        await db.query(
          'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ? AND id != ?',
          [customerId, id]
        );
      }

      const query = `
        UPDATE customer_addresses
        SET label = ?, full_name = ?, phone = ?, country = ?, state = ?, city = ?,
            address_line1 = ?, address_line2 = ?, zip_code = ?, is_default = ?
        WHERE id = ?
      `;

      const [result] = await db.query(query, [
        label,
        fullName,
        phone,
        country,
        state,
        city,
        addressLine1,
        addressLine2 || null,
        zipCode,
        isDefault ? 1 : 0,
        id
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Address not found' });
      }

      res.json({ error: false, message: 'Address updated successfully' });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ error: true, message: 'Failed to update address' });
    }
  },

  // Delete address
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.params;

      const query = 'DELETE FROM customer_addresses WHERE id = ?';
      const [result] = await db.query(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Address not found' });
      }

      res.json({ error: false, message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ error: true, message: 'Failed to delete address' });
    }
  },

  // Set default address
  setDefaultAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const { customerId } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: true, message: 'Customer ID required' });
      }

      // Unset all default addresses for this customer
      await db.query(
        'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
        [customerId]
      );

      // Set the specified address as default
      const query = `
        UPDATE customer_addresses
        SET is_default = 1
        WHERE id = ?
      `;

      const [result] = await db.query(query, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: 'Address not found' });
      }

      res.json({ error: false, message: 'Default address updated successfully' });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ error: true, message: 'Failed to set default address' });
    }
  }
};

module.exports = customerAddressesController;
