const db = require('../config/db');

const PageCategories = {
  getAll: async () => {
    try {
      const [results] = await db.execute('SELECT * FROM page_categories ORDER BY displayOrder ASC, created_at DESC');
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
      const [results] = await db.execute('SELECT * FROM page_categories WHERE id = ?', [id]);
      return results[0] || null;
    } catch (err) {
      throw err;
    }
  },

  create: async (data) => {
    const sql = `INSERT INTO page_categories (name, displayOrder, isActive, created_at, updated_at)
                 VALUES (?, ?, 1, NOW(), NOW())`;
    try {
      const [results] = await db.execute(sql, [data.name, data.displayOrder || 0]);
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
    if (data.displayOrder !== undefined) {
      fields.push('displayOrder = ?');
      params.push(data.displayOrder);
    }
    if (data.isActive !== undefined) {
      fields.push('isActive = ?');
      params.push(data.isActive);
    }

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    let sql = `UPDATE page_categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    params.push(id);

    try {
      const [results] = await db.execute(sql, params);
      return {
        affectedRows: results.affectedRows
      };
    } catch (err) {
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const [results] = await db.execute('DELETE FROM page_categories WHERE id = ?', [id]);
      return results;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = PageCategories;
