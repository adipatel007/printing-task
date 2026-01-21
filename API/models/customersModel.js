const db = require('../config/db');

const Customers = {
    create: async (data) => {
        const sql = 'INSERT INTO customers (name, email, mobile, address, city, state, zipCode, country, brandId, isActive, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [data.name, data.email, data.mobile, data.address, data.city, data.state, data.zipCode, data.country, data.brandId, data.isActive]);
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
    }
};

module.exports = Customers;
