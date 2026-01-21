const db = require('../config/db');

const BrandConfig = {
    create: async (data) => {
        const sql = 'INSERT INTO brand_config (brandId, logo, whiteLogo, blackLogo, primaryColor, twitterURL, youtubeURL, instagramURL, facebookURL, mobile, email, domain, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [
                data.brandId,
                data.logo || '',
                data.whiteLogo || '',
                data.blackLogo || '',
                data.primaryColor || '',
                data.twitterURL || '',
                data.youtubeURL || '',
                data.instagramURL || '',
                data.facebookURL || '',
                data.mobile || '',
                data.email || '',
                data.domain || ''
            ]);

            let dataJSON = {
                status: 'success',
                data: results
            }

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getByBrand: async (brandId) => {
        try {
            const [results] = await db.execute(`SELECT * FROM brand_config WHERE brandId = ?`, [brandId]);
            let dataJSON = {
                status: 'success',
                data: results.length > 0 ? results[0] : null
            };
            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await db.execute(`SELECT * FROM brand_config WHERE id = ?`, [id]);
            return results[0] || null;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        const fields = [];
        const params = [];

        if (data.logo !== undefined) {
            fields.push('logo = ?');
            params.push(data.logo);
        }
        if (data.whiteLogo !== undefined) {
            fields.push('whiteLogo = ?');
            params.push(data.whiteLogo);
        }
        if (data.blackLogo !== undefined) {
            fields.push('blackLogo = ?');
            params.push(data.blackLogo);
        }
        if (data.primaryColor !== undefined) {
            fields.push('primaryColor = ?');
            params.push(data.primaryColor);
        }
        if (data.twitterURL !== undefined) {
            fields.push('twitterURL = ?');
            params.push(data.twitterURL);
        }
        if (data.youtubeURL !== undefined) {
            fields.push('youtubeURL = ?');
            params.push(data.youtubeURL);
        }
        if (data.instagramURL !== undefined) {
            fields.push('instagramURL = ?');
            params.push(data.instagramURL);
        }
        if (data.facebookURL !== undefined) {
            fields.push('facebookURL = ?');
            params.push(data.facebookURL);
        }
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            params.push(data.email);
        }
        if (data.domain !== undefined) {
            fields.push('domain = ?');
            params.push(data.domain);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE brand_config SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        params.push(id);

        try {
            const [results] = await db.execute(sql, params);

            let dataJSON = {
                status: 'success',
                data: results
            }

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    updateByBrand: async (brandId, data) => {
        const fields = [];
        const params = [];

        if (data.logo !== undefined) {
            fields.push('logo = ?');
            params.push(data.logo);
        }
        if (data.whiteLogo !== undefined) {
            fields.push('whiteLogo = ?');
            params.push(data.whiteLogo);
        }
        if (data.blackLogo !== undefined) {
            fields.push('blackLogo = ?');
            params.push(data.blackLogo);
        }
        if (data.primaryColor !== undefined) {
            fields.push('primaryColor = ?');
            params.push(data.primaryColor);
        }
        if (data.twitterURL !== undefined) {
            fields.push('twitterURL = ?');
            params.push(data.twitterURL);
        }
        if (data.youtubeURL !== undefined) {
            fields.push('youtubeURL = ?');
            params.push(data.youtubeURL);
        }
        if (data.instagramURL !== undefined) {
            fields.push('instagramURL = ?');
            params.push(data.instagramURL);
        }
        if (data.facebookURL !== undefined) {
            fields.push('facebookURL = ?');
            params.push(data.facebookURL);
        }
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            params.push(data.email);
        }
        if (data.domain !== undefined) {
            fields.push('domain = ?');
            params.push(data.domain);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE brand_config SET ${fields.join(', ')}, updated_at = NOW() WHERE brandId = ?`;
        params.push(brandId);

        try {
            const [results] = await db.execute(sql, params);

            let dataJSON = {
                status: 'success',
                data: results
            }

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    delete: async (id) => {
        try {
            const [results] = await db.execute('DELETE FROM brand_config WHERE id = ?', [id]);
            return results;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = BrandConfig;
