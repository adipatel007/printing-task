const db = require('../config/db');

const siteconfig = {
    create: async (data) => {
        const sql = 'INSERT INTO siteconfig (siteName,clientUrl, logo, whiteLogo, icon, instagramURL, facebookURL, twitterURL, linkedInURL, youtubeURL, mobile, email, brandId, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        try {
            const [results] = await db.execute(sql, [data.siteName, data.clientUrl, data.logo, data.whiteLogo, data.icon, data.instagramURL, data.facebookURL, data.twitterURL,data.linkedInURL, data.youtubeURL, data.mobile,data.email, data.brandId || null]);

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
            const [results] = await db.execute(`SELECT * FROM siteconfig ORDER BY created_at DESC`);

            let dataJSON = {
                status: 'success',
                data: results
            };

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getByBrand: async (brandId) => {
        try {
            const [results] = await db.execute(`SELECT * FROM siteconfig WHERE brandId = ? ORDER BY created_at DESC`, [brandId]);

            let dataJSON = {
                status: 'success',
                data: results
            };

            return dataJSON;
        } catch (err) {
            throw err;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await db.execute(`SELECT * FROM siteconfig WHERE id = ?`, [id]);
            return results[0] || null;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        const fields = [];
        const params = [];

        if (data.siteName !== undefined) {
            fields.push('siteName = ?');
            params.push(data.siteName);
        }
        if (data.clientUrl !== undefined) {
            fields.push('clientUrl = ?');
            params.push(data.clientUrl);
        }
        if (data.logo !== undefined) {
            fields.push('logo = ?');
            params.push(data.logo);
        }
        if (data.whiteLogo !== undefined) {
            fields.push('whiteLogo = ?');
            params.push(data.whiteLogo);
        }
        if (data.icon !== undefined) {
            fields.push('icon = ?');
            params.push(data.icon);
        }
        if (data.instagramURL !== undefined) {
            fields.push('instagramURL = ?');
            params.push(data.instagramURL);
        }
        if (data.facebookURL !== undefined) {
            fields.push('facebookURL = ?');
            params.push(data.facebookURL);
        }
        if (data.twitterURL !== undefined) {
            fields.push('twitterURL = ?');
            params.push(data.twitterURL);
        }
        if (data.linkedInURL !== undefined) {
            fields.push('linkedInURL = ?');
            params.push(data.linkedInURL);
        }
        if (data.youtubeURL !== undefined) {
            fields.push('youtubeURL = ?');
            params.push(data.youtubeURL);
        }
        if (data.mobile !== undefined) {
            fields.push('mobile = ?');
            params.push(data.mobile);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            params.push(data.email);
        }

        if (fields.length === 0) {
            return { status: 'success', data: { affectedRows: 0 } };
        }

        let sql = `UPDATE siteconfig SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
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

    delete: async (id) => {
        try {
            const [results] = await db.execute('DELETE FROM siteconfig WHERE id = ?', [id]);
            return results;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = siteconfig;