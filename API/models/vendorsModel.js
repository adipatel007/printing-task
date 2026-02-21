const db = require('../config/db');

async function ensureVendorSchema() {
    // Ensure required columns exist on the vendors table
    const checkSql = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vendors' AND COLUMN_NAME IN ('created_at','updated_at','balance')
    `;
    const required = new Set(['created_at', 'updated_at', 'balance']);
    const missing = new Set(required);
    const [rows] = await db.execute(checkSql);
    for (const r of rows) missing.delete(r.COLUMN_NAME);
    const alters = [];
    if (missing.has('created_at')) alters.push('ADD COLUMN `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP');
    if (missing.has('updated_at')) alters.push('ADD COLUMN `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    if (missing.has('balance')) alters.push('ADD COLUMN `balance` DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER `isActive`');
    if (alters.length) {
        const alterSql = `ALTER TABLE vendors ${alters.join(', ')}`;
        await db.execute(alterSql);
    }
}

const Vendors = {
    create: async (data) => {
        await ensureVendorSchema();
        const sql = 'INSERT INTO vendors (name, email, password, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, brandId, isActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [data.name, data.email, data.password, data.mobile, data.companyName, data.gstNumber, data.panNumber, data.address, data.city, data.state, data.zipCode, data.country, data.bankName, data.accountNumber, data.ifscCode, data.servicesOffered, data.equipment, data.brandId, data.isActive]);
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
        await ensureVendorSchema();
        try {
            const [results] = await db.execute('SELECT * FROM vendors ORDER BY created_at DESC');
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
        await ensureVendorSchema();
        try {
            const offset = (pageNo - 1) * limit;

            let query = 'SELECT * FROM vendors WHERE brandId = ?';
            let queryParams = [brandId];

            if (searchtxt) {
                const columns = ['name', 'email', 'mobile', 'companyName', 'city', 'state'];
                const searchConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
                query += ` AND (${searchConditions})`;
                queryParams = queryParams.concat(columns.map(() => `%${searchtxt}%`));
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [results] = await db.execute(query, queryParams);

            let countQuery = 'SELECT COUNT(*) AS totalCount FROM vendors WHERE brandId = ?';
            let countParams = [brandId];

            if (searchtxt) {
                const columns = ['name', 'email', 'mobile', 'companyName', 'city', 'state'];
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
        const sql = 'SELECT * FROM vendors WHERE id = ?';
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
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.companyName !== undefined) {
            fields.push('companyName = ?');
            params.push(data.companyName);
        }
        if (data.gstNumber !== undefined) {
            fields.push('gstNumber = ?');
            params.push(data.gstNumber);
        }
        if (data.panNumber !== undefined) {
            fields.push('panNumber = ?');
            params.push(data.panNumber);
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
        if (data.bankName !== undefined) {
            fields.push('bankName = ?');
            params.push(data.bankName);
        }
        if (data.accountNumber !== undefined) {
            fields.push('accountNumber = ?');
            params.push(data.accountNumber);
        }
        if (data.ifscCode !== undefined) {
            fields.push('ifscCode = ?');
            params.push(data.ifscCode);
        }
        if (data.servicesOffered !== undefined) {
            fields.push('servicesOffered = ?');
            params.push(data.servicesOffered);
        }
        if (data.equipment !== undefined) {
            fields.push('equipment = ?');
            params.push(data.equipment);
        }
        if (data.isActive !== undefined) {
            fields.push('isActive = ?');
            params.push(data.isActive);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE vendors SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
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
        const sql = 'DELETE FROM vendors WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [id]);
            return results;
        } catch (err) {
            throw err;
        }
    },

    getByEmail: async (email) => {
        const sql = 'SELECT * FROM vendors WHERE email = ?';
        try {
            const [results] = await db.execute(sql, [email]);
            return {
                status: 'success',
                data: results[0]
            };
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Vendors;
