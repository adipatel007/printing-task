const db = require('../config/db');

async function ensureSchema() {
    // Ensure required columns exist on the customers table
    const checkSql = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND COLUMN_NAME IN ('password','created_at','updated_at','balance')
    `;
    const required = new Set(['password', 'created_at', 'updated_at', 'balance']);
    const missing = new Set(required);
    try {
        const [rows] = await db.execute(checkSql);
        for (const r of rows) {
            missing.delete(r.COLUMN_NAME);
        }
        // Build ALTERs for any missing columns
        const alters = [];
        if (missing.has('password')) alters.push('ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`');
        if (missing.has('created_at')) alters.push('ADD COLUMN `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP');
        if (missing.has('updated_at')) alters.push('ADD COLUMN `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        if (missing.has('balance')) alters.push('ADD COLUMN `balance` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `isActive`');
        if (alters.length) {
            const alterSql = `ALTER TABLE customers ${alters.join(', ')}`;
            await db.execute(alterSql);
        }
    } catch (err) {
        // Do not block main flow if schema check fails; rethrow only if absolutely necessary
        // Here we rethrow to surface critical DB permission issues
        throw err;
    }
}

const Customers = {
    create: async (data) => {
        // Ensure table schema before inserting
        await ensureSchema();
        // Ensure defaults for missing fields
        const name = data.name || '';
        const email = data.email || '';
        const mobile = data.mobile || '';
        const address = data.address || '';
        const city = data.city || '';
        const state = data.state || '';
        const zipCode = data.zipCode || '';
        const country = data.country || '';
        const brandId = data.brandId || null;
        const isActive = data.isActive !== undefined ? data.isActive : true;
        const password = data.password || '';

        const sql = 'INSERT INTO customers (name, email, password, mobile, address, city, state, zipCode, country, brandId, isActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [name, email, password, mobile, address, city, state, zipCode, country, brandId, isActive]);
            let dataJSON = {
                status: 'success',
                data: results
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        await ensureSchema();
        try {
            const [results] = await db.execute('SELECT * FROM customers ORDER BY created_at DESC');
            let dataJSON = {
                status: 'success',
                data: results
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getAllByPage: async (limit, pageNo, searchtxt, brandId) => {
        await ensureSchema();
        try {
            const offset = (pageNo - 1) * limit;

            let query = 'SELECT * FROM customers WHERE brandId = ?';
            let queryParams = [brandId];

            if (searchtxt) {
                const columns = ['name', 'email', 'mobile', 'city', 'state'];
                const searchConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
                query += ` AND (${searchConditions})`;
                queryParams = queryParams.concat(columns.map(() => `%${searchtxt}%`));
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [results] = await db.execute(query, queryParams);

            let countQuery = 'SELECT COUNT(*) AS totalCount FROM customers WHERE brandId = ?';
            let countParams = [brandId];

            if (searchtxt) {
                const columns = ['name', 'email', 'mobile', 'city', 'state'];
                const searchConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
                countQuery += ` AND (${searchConditions})`;
                countParams = countParams.concat(columns.map(() => `%${searchtxt}%`));
            }

            const [totalCountResults] = await db.execute(countQuery, countParams);
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

    getById: async (id) => {
        const sql = 'SELECT * FROM customers WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [id]);
            return {
                status: 'success',
                data: results[0]
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
        if (data.email !== undefined) {
            fields.push('email = ?');
            params.push(data.email);
        }
        if (data.password !== undefined) {
            fields.push('password = ?');
            params.push(data.password);
        }
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.address !== undefined) {
            fields.push('address = ?');
            params.push(data.address);
        }
        if (data.city !== undefined) {
            fields.push('city = ?');
            params.push(data.city);
        }
        if (data.state !== undefined) {
            fields.push('state = ?');
            params.push(data.state);
        }
        if (data.zipCode !== undefined) {
            fields.push('zipCode = ?');
            params.push(data.zipCode);
        }
        if (data.country !== undefined) {
            fields.push('country = ?');
            params.push(data.country);
        }
        if (data.isActive !== undefined) {
            fields.push('isActive = ?');
            params.push(data.isActive);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        params.push(id);

        try {
            const [updateResults] = await db.execute(sql, params);
            let dataJSON = {
                status: 'success',
                data: updateResults
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        const sql = 'DELETE FROM customers WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [id]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    getByEmail: async (email) => {
        const sql = 'SELECT * FROM customers WHERE email = ?';
        try {
            const [results] = await db.execute(sql, [email]);
            return {
                status: 'success',
                data: results[0]
            };
        } catch (err) {
            throw err;
        }
    },

    getByMobile: async (mobile) => {
        const sql = 'SELECT * FROM customers WHERE mobile = ?';
        try {
            const [results] = await db.execute(sql, [mobile]);
            return {
                status: 'success',
                data: results[0]
            };
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Customers;
