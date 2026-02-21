const db = require('../config/db');

module.exports = {
    create: async (data) => {
        const sql = `INSERT INTO superadmin_users (name, email, password, mobile, isActive) VALUES (?, ?, ?, ?, ?)`;
        try {
            const [result] = await db.execute(sql, [data.name, data.email, data.password, data.mobile, data.isActive]);
            return result;
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        const sql = `SELECT id, name, email, password, mobile, isActive, created_at, updated_at FROM superadmin_users ORDER BY id DESC`;
        try {
            const [results] = await db.execute(sql);
            return { data: results };
        } catch (err) {
            throw err;
        }
    },

    getAllByPage: async (limit, page, searchtxt) => {
        const offset = (page - 1) * limit;
        let sql = `SELECT id, name, email, password, mobile, isActive, created_at FROM superadmin_users`;
        let countSql = `SELECT COUNT(*) as totalCount FROM superadmin_users`;
        const params = [];

        if (searchtxt) {
            sql += ` WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?`;
            countSql += ` WHERE name LIKE ? OR email LIKE ? OR mobile LIKE ?`;
            const searchPattern = `%${searchtxt}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        try {
            const [data] = await db.execute(sql, params);
            const [countResult] = await db.execute(countSql, searchtxt ? params.slice(0, 3) : []);
            return {
                data,
                totalCount: countResult[0].totalCount
            };
        } catch (err) {
            throw err;
        }
    },

    findById: async (id) => {
        const sql = `SELECT id, name, email, mobile, isActive, created_at, updated_at FROM superadmin_users WHERE id = ?`;
        try {
            const [results] = await db.execute(sql, [id]);
            return results.length > 0 ? { data: results[0] } : null;
        } catch (err) {
            throw err;
        }
    },

    findByEmail: async (email) => {
        const sql = `SELECT * FROM superadmin_users WHERE email = ?`;
        try {
            const [results] = await db.execute(sql, [email]);
            return results.length > 0 ? { data: results[0] } : null;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        let sql = `UPDATE superadmin_users SET name = ?, email = ?, isActive = ?, updated_at = CURRENT_TIMESTAMP`;
        const params = [data.name, data.email, data.isActive];

        if (data.password) {
            sql += `, password = ?`;
            params.push(data.password);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        try {
            const [result] = await db.execute(sql, params);
            console.log('Update SQL result:', result);
            return result;
        } catch (err) {
            console.error('Update SQL error:', err);
            throw err;
        }
    },

    updateStatus: async (id, isActive) => {
        const sql = `UPDATE superadmin_users SET isActive = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        try {
            const [result] = await db.execute(sql, [isActive, id]);
            console.log('UpdateStatus SQL result:', result);
            return result;
        } catch (err) {
            console.error('UpdateStatus SQL error:', err);
            throw err;
        }
    },

    updateUserToken: async (id, token) => {
        const sql = `UPDATE superadmin_users SET token = ? WHERE id = ?`;
        try {
            const [result] = await db.execute(sql, [token, id]);
            return result;
        } catch (err) {
            throw err;
        }
    },

    getUserStatus: async (id) => {
        const sql = `SELECT isActive FROM superadmin_users WHERE id = ?`;
        try {
            const [results] = await db.execute(sql, [id]);
            return results.length > 0 ? results[0].isActive : false;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        const sql = `DELETE FROM superadmin_users WHERE id = ?`;
        try {
            const [result] = await db.execute(sql, [id]);
            return result;
        } catch (err) {
            throw err;
        }
    }
};
