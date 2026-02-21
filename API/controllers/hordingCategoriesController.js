const db = require('../config/db');

// Get all hording categories with pagination and search
exports.getAllHordingCategories = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM hording_categories WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [categories] = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM hording_categories WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND name LIKE ?';
            countParams.push(`%${search}%`);
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: categories,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching hording categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get hording category by ID
exports.getHordingCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [category] = await db.query('SELECT * FROM hording_categories WHERE id = ?', [id]);

        if (category.length === 0) {
            return res.status(404).json({ error: 'Hording category not found' });
        }

        res.status(200).json({
            status: 'success',
            data: category[0]
        });
    } catch (err) {
        console.error('Error fetching hording category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new hording category
exports.createHordingCategory = async (req, res) => {
    try {
        const { name, image } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO hording_categories (name, image) VALUES (?, ?)',
            [name, image]
        );

        res.status(201).json({
            status: 'success',
            message: 'Hording category created successfully',
            data: { id: result.insertId, name, image }
        });
    } catch (err) {
        console.error('Error creating hording category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update hording category
exports.updateHordingCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (image !== undefined) {
            updates.push('image = ?');
            params.push(image);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);
        const [result] = await db.query(
            `UPDATE hording_categories SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hording category not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Hording category updated successfully'
        });
    } catch (err) {
        console.error('Error updating hording category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete hording category
exports.deleteHordingCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM hording_categories WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hording category not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Hording category deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting hording category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
