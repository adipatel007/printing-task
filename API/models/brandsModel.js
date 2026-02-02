const db = require('../config/db');

const Brands = {
    create: async (data) => {
        const sql = `INSERT INTO brands (brandCode, brandName, domain, isActive, settingsJson, created_at, updated_at)
                     VALUES (?, ?, ?, 1, ?, NOW(), NOW())`;
        const settingsJson = JSON.stringify(data.settings || {});

        const baseCode = (data.brandName || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brand';

        try {
            // Ensure brandCode is unique by checking for existing codes with same prefix
            const [existing] = await db.execute('SELECT brandCode FROM brands WHERE brandCode LIKE ?', [`${baseCode}%`]);
            let brandCode = baseCode;
            if (existing && existing.length > 0) {
                let maxSuffix = 1;
                existing.forEach(row => {
                    const match = row.brandCode.match(new RegExp(`^${baseCode}-(\\d+)$`));
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num >= maxSuffix) maxSuffix = num + 1;
                    } else if (row.brandCode === baseCode && maxSuffix === 1) {
                        maxSuffix = 2;
                    }
                });
                if (maxSuffix > 1) {
                    brandCode = `${baseCode}-${maxSuffix}`;
                }
            }

            const params = [
                brandCode,
                data.brandName,
                data.domain || null,
                settingsJson
            ];

            const [results] = await db.execute(sql, params);

            return {
                status: 'success',
                data: { insertId: results.insertId, brandCode }
            };
        } catch (err) {
            throw err;
        }
    },

    getAll: async () => {
        try {
            const [results] = await db.execute('SELECT * FROM brands ORDER BY created_at DESC');
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
            const [results] = await db.execute('SELECT * FROM brands WHERE id = ?', [id]);
            return results[0] || null;
        } catch (err) {
            throw err;
        }
    },

    getByCode: async (brandCode) => {
        try {
            const [results] = await db.execute('SELECT * FROM brands WHERE brandCode = ? AND isActive = 1', [brandCode]);
            return results[0] || null;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        const sql = `UPDATE brands
                     SET brandName = ?, mobile = ?, email = ?, primaryColor = ?, whiteLogo = ?, blackLogo = ?, domain = ?, settingsJson = ?, updated_at = NOW()
                     WHERE id = ?`;
        const settingsJson = JSON.stringify(data.settings || {});

        try {
            const [results] = await db.execute(sql, [
                data.brandName,
                data.mobile,
                data.email,
                data.primaryColor,
                data.whiteLogo,
                data.blackLogo,
                data.domain || null,
                settingsJson,
                id
            ]);

            return {
                status: 'success',
                data: results
            };
        } catch (err) {
            throw err;
        }
    },

    updateStatus: async (id, isActive) => {
        const sql = 'UPDATE brands SET isActive = ?, updated_at = NOW() WHERE id = ?';
        try {
            const [results] = await db.execute(sql, [isActive, id]);
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
            const [results] = await db.execute('DELETE FROM brands WHERE id = ?', [id]);
            return results;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Brands;
