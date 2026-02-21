const db = require('../config/db');

async function ensureProductSchema() {
    // Ensure required columns exist on the products table
    const checkSql = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
    `;
    try {
        const [rows] = await db.execute(checkSql);
        const columnNames = rows.map(col => col.COLUMN_NAME);
        const alters = [];

        if (!columnNames.includes('id')) {
            await db.execute(`
                CREATE TABLE products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    basePrice DECIMAL(10, 2) NOT NULL DEFAULT 0,
                    moq INT NOT NULL DEFAULT 1,
                    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
                    isActive TINYINT(1) NOT NULL DEFAULT 1,
                    createdBy INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_category (category),
                    INDEX idx_isActive (isActive),
                    INDEX idx_createdBy (createdBy)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
        }
    } catch (err) {
        console.error('Error ensuring product schema:', err);
    }
}

const Products = {
    create: async (data) => {
        await ensureProductSchema();
        const sql = 'INSERT INTO products (name, category, description, basePrice, moq, unit, isActive, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        try {
            const [results] = await db.execute(sql, [
                data.name,
                data.category,
                data.description || null,
                data.basePrice,
                data.moq,
                data.unit,
                data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
                data.createdBy || null
            ]);
            let dataJSON = {
                status: 'success',
                data: { id: results.insertId, ...data }
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        await ensureProductSchema();
        try {
            const [results] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
            let dataJSON = {
                status: 'success',
                data: results
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getAllByPage: async (limit, page, searchtxt = '') => {
        await ensureProductSchema();
        try {
            const offset = (page - 1) * limit;
            let query = `SELECT * FROM products`;
            let queryParams = [];

            if (searchtxt) {
                query += ` WHERE name LIKE ? OR category LIKE ?`;
                queryParams.push(`%${searchtxt}%`, `%${searchtxt}%`);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [data] = await db.execute(query, queryParams);

            const [countResult] = await db.execute('SELECT COUNT(*) as total FROM products');
            const totalCount = countResult[0].total;

            return {
                status: 'success',
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            };
        } catch (err) {
            throw err;
        }
    },

    getById: async (id) => {
        await ensureProductSchema();
        try {
            const [results] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
            return results[0] || null;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        await ensureProductSchema();
        const sql = 'UPDATE products SET name = ?, category = ?, description = ?, basePrice = ?, moq = ?, unit = ?, isActive = ? WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [
                data.name,
                data.category,
                data.description || null,
                data.basePrice,
                data.moq,
                data.unit,
                data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
                id
            ]);
            return results.affectedRows > 0 ? { id, ...data } : null;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        await ensureProductSchema();
        try {
            const [results] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
            return results.affectedRows > 0;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Products;
