const db = require('../config/db');

// Get all banners with pagination and search
exports.getAllBanners = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM banners';
        let params = [];

        if (search) {
            query += ' WHERE redirectURL LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY sortOrder ASC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [banners] = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM banners';
        let countParams = [];
        if (search) {
            countQuery += ' WHERE redirectURL LIKE ?';
            countParams.push(`%${search}%`);
        }
        const [countResult] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: banners,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total
            }
        });
    } catch (err) {
        console.error('Error fetching banners:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get banner by ID
exports.getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const [banner] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);

        if (banner.length === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({
            status: 'success',
            data: banner[0]
        });
    } catch (err) {
        console.error('Error fetching banner:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new banner
exports.createBanner = async (req, res) => {
    try {
        const { image, redirectURL, isActive = 1, sortOrder = 0 } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const [result] = await db.query(
            'INSERT INTO banners (image, redirectURL, isActive, sortOrder) VALUES (?, ?, ?, ?)',
            [image, redirectURL, isActive, sortOrder]
        );

        res.status(201).json({
            status: 'success',
            message: 'Banner created successfully',
            data: { id: result.insertId, image, redirectURL, isActive, sortOrder }
        });
    } catch (err) {
        console.error('Error creating banner:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update banner
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { image, redirectURL, isActive, sortOrder } = req.body;

        const updates = [];
        const params = [];

        if (image !== undefined) {
            updates.push('image = ?');
            params.push(image);
        }
        if (redirectURL !== undefined) {
            updates.push('redirectURL = ?');
            params.push(redirectURL);
        }
        if (isActive !== undefined) {
            updates.push('isActive = ?');
            params.push(isActive);
        }
        if (sortOrder !== undefined) {
            updates.push('sortOrder = ?');
            params.push(sortOrder);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);
        const [result] = await db.query(
            `UPDATE banners SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Banner updated successfully'
        });
    } catch (err) {
        console.error('Error updating banner:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Banner deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting banner:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update banner status
exports.updateBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive is required' });
        }

        const [result] = await db.query(
            'UPDATE banners SET isActive = ? WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Banner status updated successfully'
        });
    } catch (err) {
        console.error('Error updating banner status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
