var jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;
        let decoded;

        if (authHeader) {
            token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
            decoded = jwt.verify(token, process.env.JWT_KEY);
        }
        let user = [];
        if (decoded) {
            if (decoded.type === 'Super Administrator User') {
                user = await db.execute(`SELECT * FROM superadmin_users WHERE token = ?`, [token]);
            } else if (decoded.type === 'Administrator User') {
                user = await db.execute(`SELECT * FROM users WHERE token = ?`, [token]);
            }
        }

        if (user.length == 0) {
            return res.status(401).send({ status: 401, msg: "Unauthorized" });
        } else {
            req.userDetails = { data : user[0] , type : decoded.type, userType : decoded.userType, brandId : decoded.brandId };
            next();
        }
    } catch (e) {
        console.log('Auth error:', e);
        return res.status(401).send({ status: 401, msg: "Unauthorized" });
    }
};