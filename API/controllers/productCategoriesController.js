const db = require('../config/db');

// Get all product categories with pagination and search
exports.getAllCategories = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, isActive } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM product_categories WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (isActive !== undefined) {
            query += ' AND isActive = ?';
            params.push(parseInt(isActive));
        }

        query += ' ORDER BY sortOrder ASC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [categories] = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM product_categories WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND name LIKE ?';
            countParams.push(`%${search}%`);
        }
        if (isActive !== undefined) {
            countQuery += ' AND isActive = ?';
            countParams.push(parseInt(isActive));
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
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [category] = await db.query('SELECT * FROM product_categories WHERE id = ?', [id]);

        if (category.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            status: 'success',
            data: category[0]
        });
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name, image, isActive = 1, sortOrder = 0 } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO product_categories (name, image, isActive, sortOrder) VALUES (?, ?, ?, ?)',
            [name, image, isActive, sortOrder]
        );

        res.status(201).json({
            status: 'success',
            message: 'Category created successfully',
            data: { id: result.insertId, name, image, isActive, sortOrder }
        });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, isActive, sortOrder } = req.body;

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
            `UPDATE product_categories SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Category updated successfully'
        });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM product_categories WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update category status
exports.updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive is required' });
        }

        const [result] = await db.query(
            'UPDATE product_categories SET isActive = ? WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Category status updated successfully'
        });
    } catch (err) {
        console.error('Error updating category status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
