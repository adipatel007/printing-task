const db = require('../config/db');

// Get all product types with pagination and search (with category name join)
exports.getAllProductTypes = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, isActive, categoryId } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT pt.*, pc.name as categoryName
            FROM product_types pt
            LEFT JOIN product_categories pc ON pt.categoryId = pc.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND pt.name LIKE ?';
            params.push(`%${search}%`);
        }

        if (isActive !== undefined) {
            query += ' AND pt.isActive = ?';
            params.push(parseInt(isActive));
        }

        if (categoryId && !isNaN(parseInt(categoryId))) {
            query += ' AND pt.categoryId = ?';
            params.push(parseInt(categoryId));
        }

        query += ' ORDER BY pt.sortOrder ASC, pt.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [productTypes] = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM product_types WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND name LIKE ?';
            countParams.push(`%${search}%`);
        }
        if (isActive !== undefined) {
            countQuery += ' AND isActive = ?';
            countParams.push(parseInt(isActive));
        }
        if (categoryId && !isNaN(parseInt(categoryId))) {
            countQuery += ' AND categoryId = ?';
            countParams.push(parseInt(categoryId));
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: productTypes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching product types:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get product type by ID
exports.getProductTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [productType] = await db.query(`
            SELECT pt.*, pc.name as categoryName
            FROM product_types pt
            LEFT JOIN product_categories pc ON pt.categoryId = pc.id
            WHERE pt.id = ?
        `, [id]);

        if (productType.length === 0) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        res.status(200).json({
            status: 'success',
            data: productType[0]
        });
    } catch (err) {
        console.error('Error fetching product type:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new product type
exports.createProductType = async (req, res) => {
    try {
        const { name, categoryId, image, isActive = 1, sortOrder = 0 } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({ error: 'Name and categoryId are required' });
        }

        const [result] = await db.query(
            'INSERT INTO product_types (name, categoryId, image, isActive, sortOrder) VALUES (?, ?, ?, ?, ?)',
            [name, categoryId, image, isActive, sortOrder]
        );

        res.status(201).json({
            status: 'success',
            message: 'Product type created successfully',
            data: { id: result.insertId, name, categoryId, image, isActive, sortOrder }
        });
    } catch (err) {
        console.error('Error creating product type:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update product type
exports.updateProductType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId, image, isActive, sortOrder } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (categoryId !== undefined) {
            updates.push('categoryId = ?');
            params.push(categoryId);
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
            `UPDATE product_types SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product type updated successfully'
        });
    } catch (err) {
        console.error('Error updating product type:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete product type
exports.deleteProductType = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM product_types WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product type deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting product type:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update product type status
exports.updateProductTypeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive is required' });
        }

        const [result] = await db.query(
            'UPDATE product_types SET isActive = ? WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product type not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product type status updated successfully'
        });
    } catch (err) {
        console.error('Error updating product type status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
