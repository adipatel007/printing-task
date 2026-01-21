const db = require('../config/db');

const Pages = {
  create: async (data,userDetails) => {
    const sql = 'INSERT INTO pages (pagename, displayorder, url, icon,categoryId, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
    try {
      const [results] = await db.execute(sql, [data.pagename, data.displayorder, data.url, data.icon, data.categoryId]);
      
      let dataJSON = {
        status: 'success',
        data: results
    }
      return dataJSON;
    } catch (err) {
      throw err;
    }
  },
  
  getAll: async () => {
    try {

      const [results] = await db.execute(`
        SELECT 
          pages.*, 
          COALESCE(page_categories.name, 'Uncategorized') AS categoryName
        FROM pages
        LEFT JOIN page_categories ON pages.categoryId = page_categories.id
        ORDER BY pages.created_at DESC
      `);
      
      let dataJSON = {
        status: 'success',
        data: results
    }
      return dataJSON;
    } catch (err) {
      throw err;
    }
  },
  
  getAllByPage: async (limit, pageNo, searchtxt) => {
    try {
      const offset = (pageNo - 1) * limit;
  
      let query = `
        SELECT 
          pages.*, 
          COALESCE(page_categories.name, 'Uncategorized') AS categoryName
        FROM pages
        LEFT JOIN page_categories ON pages.categoryId = page_categories.id
      `;
      let queryParams = [];
  
      if (searchtxt) {
        const columns = ['pagename'];
        const searchConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
        query += ` WHERE ${searchConditions}`;
        queryParams = columns.map(() => `%${searchtxt}%`);
      }
  
      query += ' ORDER BY pages.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
  
      const [results] = await db.execute(query, queryParams);
  
      const [totalCountResults] = await db.execute('SELECT COUNT(*) AS totalCount FROM pages');
      const totalCount = totalCountResults[0].totalCount;
  
      return {
        status: 'success',
        data: results,
        totalCount: totalCount
      };
    } catch (err) {
      throw err;
    }
  },  


  update: async (id, data,userDetails) => {
    const fields = [];
    const params = [];

    if (data.pagename !== undefined && data.pagename !== null) {
      fields.push('pagename = ?');
      params.push(data.pagename);
    }
    if (data.displayorder !== undefined && data.displayorder !== null) {
      fields.push('displayorder = ?');
      params.push(data.displayorder);
    }
    if (data.categoryId !== undefined && data.categoryId !== null) {
      fields.push('categoryId = ?');
      params.push(data.categoryId);
    }
    if (data.url !== undefined && data.url !== null) {
      fields.push('url = ?');
      params.push(data.url);
    }
    if (data.icon !== undefined && data.icon !== null) {
      fields.push('icon = ?');
      params.push(data.icon);
    }
    if (data.isActive !== undefined) {
      fields.push('isActive = ?');
      params.push(data.isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return { status: 'success', data: { affectedRows: 0 } };
    }

    const sql = `UPDATE pages SET ${fields.join(', ')}, updated_at = NOW() WHERE pageId = ?`;
    params.push(id);

    try {
      const [results] = await db.execute(sql, params);
      
      let dataJson = {
        status: 'success',
        data: results
      }
      return dataJson;
    } catch (err) {
      console.error('Update page error:', err);
      throw err;
    }
  },

  delete: async (id,userDetails) => {
    try {
      const [results] = await db.execute('DELETE FROM pages WHERE pageId = ?', [id]);
      
      return results;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = Pages;