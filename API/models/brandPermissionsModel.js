const db = require('../config/db');

const BrandPermissions = {
  getAll: async () => {
    try {
      const [results] = await db.execute(`
        SELECT permissions.*, brand_roles.name as roleName, pages.pagename as pageName
        FROM permissions
        LEFT JOIN brand_roles ON permissions.roleId = brand_roles.id
        LEFT JOIN pages ON permissions.pageId = pages.pageId
        ORDER BY permissions.created_at DESC
      `);
      return {
        status: 'success',
        data: results
      };
    } catch (err) {
      throw err;
    }
  },

  getByRole: async (roleId) => {
    try {
      const [results] = await db.execute(`
        SELECT permissions.*, pages.pagename as pageName, pages.url as pageUrl, pagescategory.name as categoryName
        FROM permissions
        LEFT JOIN pages ON permissions.pageId = pages.pageId
        LEFT JOIN pagescategory ON pages.categoryId = pagescategory.id
        WHERE permissions.roleId = ?
        ORDER BY pagescategory.displayOrder ASC, pages.displayOrder ASC
      `, [roleId]);
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
      const [results] = await db.execute('SELECT * FROM permissions WHERE id = ?', [id]);
      return results[0] || null;
    } catch (err) {
      throw err;
    }
  },

  create: async (data) => {
    const sql = `INSERT INTO permissions (roleId, pageId, canView, canAdd, canEdit, canDelete, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    try {
      const [results] = await db.execute(sql, [
        data.roleId,
        data.pageId,
        data.canView || 0,
        data.canAdd || 0,
        data.canEdit || 0,
        data.canDelete || 0
      ]);
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

    if (data.canView !== undefined) {
      fields.push('canView = ?');
      params.push(data.canView);
    }
    if (data.canAdd !== undefined) {
      fields.push('canAdd = ?');
      params.push(data.canAdd);
    }
    if (data.canEdit !== undefined) {
      fields.push('canEdit = ?');
      params.push(data.canEdit);
    }
    if (data.canDelete !== undefined) {
      fields.push('canDelete = ?');
      params.push(data.canDelete);
    }

    if (fields.length === 0) {
      return { status: 'success', data: { affectedRows: 0 } };
    }

    let sql = `UPDATE permissions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
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
      const [results] = await db.execute('DELETE FROM permissions WHERE id = ?', [id]);
      return results;
    } catch (err) {
      throw err;
    }
  },

  bulkUpsert: async (roleId, permissions) => {
    try {
      for (const perm of permissions) {
        const existing = await db.execute(
          'SELECT id FROM permissions WHERE roleId = ? AND pageId = ?',
          [roleId, perm.pageId]
        );

        if (existing[0] && existing[0].length > 0) {
          await db.execute(
            `UPDATE permissions SET canView = ?, canAdd = ?, canEdit = ?, canDelete = ?, updated_at = NOW()
             WHERE roleId = ? AND pageId = ?`,
            [perm.canView || 0, perm.canAdd || 0, perm.canEdit || 0, perm.canDelete || 0, roleId, perm.pageId]
          );
        } else {
          await db.execute(
            `INSERT INTO permissions (roleId, pageId, canView, canAdd, canEdit, canDelete, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [roleId, perm.pageId, perm.canView || 0, perm.canAdd || 0, perm.canEdit || 0, perm.canDelete || 0]
          );
        }
      }
      return {
        status: 'success',
        message: 'Permissions updated successfully'
      };
    } catch (err) {
      throw err;
    }
  }
};

module.exports = BrandPermissions;
