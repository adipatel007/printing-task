const db = require('../config/db');

const BrandUsers = {
  // Get users for a specific brand (by brandId)
  getByBrand: async (brandId, limit = 10, offset = 0, searchTxt = '') => {
    const searchCondition = searchTxt ? `AND (u.name LIKE ? OR u.email LIKE ?)` : '';
    const searchParams = searchTxt ? [`%${searchTxt}%`, `%${searchTxt}%`] : [];
    
    const dataSql = `
      SELECT u.id, u.name, u.email, u.password, u.userType, u.brandId, u.roleId, u.isActive, u.created_at,
             COALESCE(br.name, 'No Role') AS roleName
      FROM users u
      LEFT JOIN brand_roles br ON u.roleId = br.id
      WHERE u.brandId = ? ${searchCondition}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    console.log('getByBrand SQL:', dataSql);
    console.log('getByBrand params:', [brandId, ...searchParams, limit, offset]);
    
    const [results] = await db.execute(dataSql, [brandId, ...searchParams, limit, offset]);
    console.log('getByBrand results:', results);
    
    const countSql = `
      SELECT COUNT(*) as total
      FROM users u
      WHERE u.brandId = ? ${searchCondition}
    `;
    const [countResult] = await db.execute(countSql, [brandId, ...searchParams]);
    
    return {
      status: 'success',
      data: results,
      totalCount: countResult[0].total,
    };
  },

  // Get users for brand inferred from token (admin side)
  getByBrandFromToken: async (brandId) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.password, u.userType, u.brandId, u.roleId, u.isActive, u.created_at,
             COALESCE(br.name, 'No Role') AS roleName
      FROM users u
      LEFT JOIN brand_roles br ON u.roleId = br.id
      WHERE u.brandId = ?
      ORDER BY u.created_at DESC
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
      INSERT INTO users (name, email, password, userType, brandId, roleId, isActive, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const [results] = await db.execute(sql, [
      data.name,
      data.email,
      data.password,
      data.userType,
      data.brandId,
      data.roleId || null,
      data.isActive ?? 1,
    ]);

    return {
      status: 'success',
      data: results,
    };
  },

  // Update brand user (password optional)
  updateUser: async (id, data, brandScope) => {
    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email);
    }
    if (data.userType !== undefined) {
      fields.push('userType = ?');
      params.push(data.userType);
    }
    if (data.roleId !== undefined) {
      fields.push('roleId = ?');
      params.push(data.roleId);
    }
    if (data.isActive !== undefined) {
      fields.push('isActive = ?');
      params.push(data.isActive);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      params.push(data.password);
    }

    if (fields.length === 0) {
      return { status: 'success', data: { affectedRows: 0 } };
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

  // Hard delete brand user
  deleteUser: async (id, brandScope) => {
    let sql = 'DELETE FROM users WHERE id = ?';
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
