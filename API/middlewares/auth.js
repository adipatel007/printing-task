var jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (!authHeader) {
            return res.status(401).send({ status: 401, msg: "Unauthorized" });
        }

        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            console.log('JWT verify error:', err);
            return res.status(401).send({ status: 401, msg: "Unauthorized" });
        }

        let rows = [];

        if (decoded && decoded.type === 'Super Administrator User') {
            const [superAdmins] = await db.execute(`SELECT * FROM superadmin_users WHERE token = ?`, [token]);
            rows = superAdmins;
        } else if (decoded && decoded.type === 'Administrator User') {
            const [users] = await db.execute(`SELECT * FROM users WHERE token = ?`, [token]);
            rows = users;
        } else {
            return res.status(401).send({ status: 401, msg: "Unauthorized" });
        }

        if (!rows || rows.length === 0) {
            return res.status(401).send({ status: 401, msg: "Unauthorized" });
        }

        const dbUser = rows[0];

        let userType = decoded.userType;
        if (!userType) {
            if (decoded.type === 'Super Administrator User') {
                userType = 'Super Admin';
            } else if (decoded.type === 'Administrator User') {
                userType = 'Admin';
            }
        }

        // Prefer brandId from DB user record; fall back to token if present
        const brandId = dbUser.brandId ?? decoded.brandId ?? null;

        req.userDetails = {
            data: dbUser,
            type: decoded.type,
            userType: userType,
            brandId: brandId
        };

        console.log('Auth middleware - req.userDetails:', req.userDetails);
        next();
    } catch (e) {
        console.log('Auth error:', e);
        return res.status(401).send({ status: 401, msg: "Unauthorized" });
    }
};