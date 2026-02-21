const db = require('../config/db');

// Get all hoardings with pagination and search
exports.getAllHoardings = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM hoardings WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (name LIKE ? OR code LIKE ? OR location LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Date range filtering for availability
        if (startDate && endDate) {
            // Subquery to find hoardings that are NOT booked during the selected date range
            // Two date ranges overlap if: booking.startDate <= filter.endDate AND booking.endDate >= filter.startDate
            query += ` AND id NOT IN (
                SELECT hoardingId FROM bookings
                WHERE (startDate <= ? AND endDate >= ?)
            )`;
            params.push(endDate, startDate);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [hoardings] = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM hoardings WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND (name LIKE ? OR code LIKE ? OR location LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (startDate && endDate) {
            countQuery += ` AND id NOT IN (
                SELECT hoardingId FROM bookings
                WHERE (startDate <= ? AND endDate >= ?)
            )`;
            countParams.push(endDate, startDate);
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: hoardings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching hoardings:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get hoarding by ID
exports.getHordingById = async (req, res) => {
    try {
        const { id } = req.params;
        const [hoarding] = await db.query('SELECT * FROM hoardings WHERE id = ?', [id]);

        if (hoarding.length === 0) {
            return res.status(404).json({ error: 'Hording not found' });
        }

        // Parse JSON fields
        if (hoarding[0].benefits) {
            hoarding[0].benefits = JSON.parse(hoarding[0].benefits);
        }
        if (hoarding[0].services) {
            hoarding[0].services = JSON.parse(hoarding[0].services);
        }

        res.status(200).json({
            status: 'success',
            data: hoarding[0]
        });
    } catch (err) {
        console.error('Error fetching hording:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new hording
exports.createHording = async (req, res) => {
    try {
        const {
            thumbnail, name, description, code, price,
            state, city, location, size, facing, type,
            visibility, dailyfootfall, nearby, company,
            benefits, services
        } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required' });
        }

        const [result] = await db.query(
            `INSERT INTO hoardings (
                thumbnail, name, description, code, price,
                state, city, location, size, facing, type,
                visibility, dailyfootfall, nearby, company,
                benefits, services
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                thumbnail, name, description, code, price,
                state, city, location, size, facing, type,
                visibility, dailyfootfall, nearby, company,
                JSON.stringify(benefits || []), JSON.stringify(services || [])
            ]
        );

        res.status(201).json({
            status: 'success',
            message: 'Hording created successfully',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating hording:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update hording
exports.updateHording = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            thumbnail, name, description, code, price,
            state, city, location, size, facing, type,
            visibility, dailyfootfall, nearby, company,
            benefits, services
        } = req.body;

        const [result] = await db.query(
            `UPDATE hoardings SET
                thumbnail = ?, name = ?, description = ?, code = ?, price = ?,
                state = ?, city = ?, location = ?, size = ?, facing = ?, type = ?,
                visibility = ?, dailyfootfall = ?, nearby = ?, company = ?,
                benefits = ?, services = ?
            WHERE id = ?`,
            [
                thumbnail, name, description, code, price,
                state, city, location, size, facing, type,
                visibility, dailyfootfall, nearby, company,
                JSON.stringify(benefits || []), JSON.stringify(services || []),
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hording not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Hording updated successfully'
        });
    } catch (err) {
        console.error('Error updating hording:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete hording
exports.deleteHording = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM hoardings WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hording not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Hording deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting hording:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
