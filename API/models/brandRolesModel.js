const db = require('../config/db');

const BrandRoles = {
  getAll: async () => {
    try {
      const [results] = await db.execute(`
        SELECT brand_roles.*, brands.brandName
        FROM brand_roles
        LEFT JOIN brands ON brand_roles.brandId = brands.id
        ORDER BY brand_roles.created_at DESC
      `);
      return {
        status: 'success',
        data: results
      };
    } catch (err) {
      throw err;
    }
  },

  getByBrand: async (brandId) => {
    try {
      const [results] = await db.execute(
        'SELECT * FROM brand_roles WHERE brandId = ? ORDER BY created_at DESC',
        [brandId]
      );
      return {
        status: 'success',
        data: results
      };
    } catch (err) {
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const [results] = await db.execute('SELECT * FROM brand_roles WHERE id = ?', [id]);
      return results[0] || null;
    } catch (err) {
      throw err;
    }
  },

  create: async (data) => {
    const sql = `INSERT INTO brand_roles (brandId, name, description, isActive, created_at, updated_at)
                 VALUES (?, ?, ?, 1, NOW(), NOW())`;
    try {
      const [results] = await db.execute(sql, [data.brandId, data.name, data.description || null]);
      return {
        status: 'success',
        data: { insertId: results.insertId }
      };
    } catch (err) {
      throw err;
    }
  },

  update: async (id, data) => {
    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.isActive !== undefined) {
      fields.push('isActive = ?');
      params.push(data.isActive);
    }

    if (fields.length === 0) {
      return { status: 'success', data: { affectedRows: 0 } };
    }

    let sql = `UPDATE brand_roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);

    try {
      const [results] = await db.execute(sql, params);
      return {
        status: 'success',
        data: results
      };
    } catch (err) {
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const [results] = await db.execute('DELETE FROM brand_roles WHERE id = ?', [id]);
      return results;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = BrandRoles;
