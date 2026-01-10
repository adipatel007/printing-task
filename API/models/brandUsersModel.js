const db = require('../config/db');

const BrandUsers = {
  // Get users for a specific brand (by brandId)
  getByBrand: async (brandId) => {
    const sql = `
      SELECT id, name, email, userType, brandId, isActive, created_at
      FROM users
      WHERE brandId = ?
      ORDER BY created_at DESC
    `;
    const [results] = await db.execute(sql, [brandId]);
    return {
      status: 'success',
      data: results,
    };
  },

  // Get users for brand inferred from token (admin side)
  getByBrandFromToken: async (brandId) => {
    const sql = `
      SELECT id, name, email, userType, brandId, isActive, created_at
      FROM users
      WHERE brandId = ?
      ORDER BY created_at DESC
    `;
    const [results] = await db.execute(sql, [brandId]);
    return {
      status: 'success',
      data: results,
    };
  },

  // Create new brand user (password plain text as per requirement)
  createForBrand: async (data) => {
    const sql = `
      INSERT INTO users (name, email, password, userType, brandId, isActive, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [results] = await db.execute(sql, [
      data.name,
      data.email,
      data.password,
      data.userType,
      data.brandId,
      data.isActive ?? 1,
    ]);

    return {
      status: 'success',
      data: results,
    };
  },

  // Update brand user (password optional)
  updateUser: async (id, data, brandScope) => {
    // brandScope is optional guard for admin (brandId restriction)
    const fields = ['name = ?', 'email = ?', 'userType = ?', 'isActive = ?'];
    const params = [
      data.name,
      data.email,
      data.userType,
      data.isActive,
    ];

    if (data.password) {
      fields.push('password = ?');
      params.push(data.password);
    }

    let sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);

    if (brandScope && brandScope.brandId) {
      sql += ' AND brandId = ?';
      params.push(brandScope.brandId);
    }

    const [results] = await db.execute(sql, params);

    return {
      status: 'success',
      data: results,
    };
  },

  // Soft delete (deactivate) brand user
  deactivateUser: async (id, brandScope) => {
    let sql = 'UPDATE users SET isActive = 0, updated_at = NOW() WHERE id = ?';
    const params = [id];

    if (brandScope && brandScope.brandId) {
      sql += ' AND brandId = ?';
      params.push(brandScope.brandId);
    }

    const [results] = await db.execute(sql, params);
    return {
      status: 'success',
      data: results,
    };
  },
};

module.exports = BrandUsers;
