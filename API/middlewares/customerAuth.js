var jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports.customerAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (!authHeader) {
            return res.status(401).json({ error: true, message: 'Unauthorized - No token provided' });
        }

        token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            console.log('JWT verify error:', err);
            return res.status(401).json({ error: true, message: 'Unauthorized - Invalid token' });
        }

        // Check if this is a customer token
        if (!decoded || decoded.type !== 'Customer') {
            return res.status(401).json({ error: true, message: 'Unauthorized - Invalid token type' });
        }

        // Get customer from database
        const [customers] = await db.execute(`SELECT * FROM customers WHERE id = ? AND token = ?`, [decoded.id, token]);

        if (!customers || customers.length === 0) {
            return res.status(401).json({ error: true, message: 'Unauthorized - Customer not found' });
        }

        const customer = customers[0];

        // Set customer info in request
        req.customer = customer;
        req.customerId = customer.id;

        next();
    } catch (e) {
        console.log('Customer auth error:', e);
        return res.status(401).json({ error: true, message: 'Unauthorized - Authentication failed' });
    }
};
