const db = require('../config/db');

// Get all public products with pagination and filters (no auth)
exports.getPublicProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 20, categoryId, typeId, minPrice, maxPrice } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, pc.name as categoryName, pt.name as typeName
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            LEFT JOIN product_types pt ON p.typeId = pt.id
            WHERE p.isActive = 1
        `;
        const params = [];

        if (search) {
            query += ' AND p.title LIKE ?';
            params.push(`%${search}%`);
        }

        if (categoryId && !isNaN(parseInt(categoryId))) {
            query += ' AND p.categoryId = ?';
            params.push(parseInt(categoryId));
        }

        if (typeId && !isNaN(parseInt(typeId))) {
            query += ' AND p.typeId = ?';
            params.push(parseInt(typeId));
        }

        if (minPrice && !isNaN(parseFloat(minPrice))) {
            query += ' AND p.discountedPrice >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            query += ' AND p.discountedPrice <= ?';
            params.push(parseFloat(maxPrice));
        }

        query += ' ORDER BY p.isFeatured DESC, p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        // Parse variations and gallery for each product
        products.forEach(product => {
            if (product.variations) {
                try {
                    product.variations = JSON.parse(product.variations);
                } catch (e) {
                    product.variations = [];
                }
            } else {
                product.variations = [];
            }
            if (product.gallery) {
                try {
                    product.gallery = JSON.parse(product.gallery);
                } catch (e) {
                    product.gallery = [];
                }
            } else {
                product.gallery = [];
            }
        });

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.isActive = 1';
        const countParams = [];
        if (search) {
            countQuery += ' AND p.title LIKE ?';
            countParams.push(`%${search}%`);
        }
        if (categoryId && !isNaN(parseInt(categoryId))) {
            countQuery += ' AND p.categoryId = ?';
            countParams.push(parseInt(categoryId));
        }
        if (typeId && !isNaN(parseInt(typeId))) {
            countQuery += ' AND p.typeId = ?';
            countParams.push(parseInt(typeId));
        }
        if (minPrice && !isNaN(parseFloat(minPrice))) {
            countQuery += ' AND p.discountedPrice >= ?';
            countParams.push(parseFloat(minPrice));
        }
        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            countQuery += ' AND p.discountedPrice <= ?';
            countParams.push(parseFloat(maxPrice));
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching public products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get public product by ID (no auth)
exports.getPublicProductById = async (req, res) => {
    try {
        const { id } = req.params;

        let query = `
            SELECT p.*, pc.name as categoryName, pt.name as typeName
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            LEFT JOIN product_types pt ON p.typeId = pt.id
            WHERE p.id = ? AND p.isActive = 1
        `;

        const [products] = await db.query(query, [parseInt(id)]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];

        // Parse variations and gallery
        if (product.variations) {
            try {
                product.variations = JSON.parse(product.variations);
            } catch (e) {
                product.variations = [];
            }
        } else {
            product.variations = [];
        }

        if (product.gallery) {
            try {
                product.gallery = JSON.parse(product.gallery);
            } catch (e) {
                product.gallery = [];
            }
        } else {
            product.gallery = [];
        }

        // Ensure pack is integer
        product.pack = parseInt(product.pack, 10) || 1;

        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (err) {
        console.error('Error fetching public product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get products by category (no auth)
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 20, typeId, minPrice, maxPrice } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, pc.name as categoryName, pt.name as typeName
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            LEFT JOIN product_types pt ON p.typeId = pt.id
            WHERE p.isActive = 1 AND p.categoryId = ?
        `;
        const params = [parseInt(categoryId)];

        if (typeId && !isNaN(parseInt(typeId))) {
            query += ' AND p.typeId = ?';
            params.push(parseInt(typeId));
        }

        if (minPrice && !isNaN(parseFloat(minPrice))) {
            query += ' AND p.discountedPrice >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            query += ' AND p.discountedPrice <= ?';
            params.push(parseFloat(maxPrice));
        }

        query += ' ORDER BY p.isFeatured DESC, p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        // Parse variations and gallery for each product
        products.forEach(product => {
            if (product.variations) {
                try {
                    product.variations = JSON.parse(product.variations);
                } catch (e) {
                    product.variations = [];
                }
            } else {
                product.variations = [];
            }
            if (product.gallery) {
                try {
                    product.gallery = JSON.parse(product.gallery);
                } catch (e) {
                    product.gallery = [];
                }
            } else {
                product.gallery = [];
            }
        });

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.isActive = 1 AND p.categoryId = ?';
        const countParams = [parseInt(categoryId)];
        if (typeId && !isNaN(parseInt(typeId))) {
            countQuery += ' AND p.typeId = ?';
            countParams.push(parseInt(typeId));
        }
        if (minPrice && !isNaN(parseFloat(minPrice))) {
            countQuery += ' AND p.discountedPrice >= ?';
            countParams.push(parseFloat(minPrice));
        }
        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
            countQuery += ' AND p.discountedPrice <= ?';
            countParams.push(parseFloat(maxPrice));
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all products with pagination and search (with category and type name join)
exports.getAllProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, isActive, categoryId, typeId } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, pc.name as categoryName, pt.name as typeName
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            LEFT JOIN product_types pt ON p.typeId = pt.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND p.title LIKE ?';
            params.push(`%${search}%`);
        }

        if (isActive !== undefined) {
            query += ' AND p.isActive = ?';
            params.push(parseInt(isActive));
        }

        if (categoryId && !isNaN(parseInt(categoryId))) {
            query += ' AND p.categoryId = ?';
            params.push(parseInt(categoryId));
        }

        if (typeId && !isNaN(parseInt(typeId))) {
            query += ' AND p.typeId = ?';
            params.push(parseInt(typeId));
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        // Parse variations for each product
        products.forEach(product => {
            if (product.variations) {
                try {
                    product.variations = JSON.parse(product.variations);
                } catch (e) {
                    product.variations = [];
                }
            } else {
                product.variations = [];
            }
            // Parse gallery
            if (product.gallery) {
                try {
                    product.gallery = JSON.parse(product.gallery);
                } catch (e) {
                    product.gallery = [];
                }
            } else {
                product.gallery = [];
            }
        });

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        const countParams = [];
        if (search) {
            countQuery += ' AND title LIKE ?';
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
        if (typeId && !isNaN(parseInt(typeId))) {
            countQuery += ' AND typeId = ?';
            countParams.push(parseInt(typeId));
        }
        const [count] = await db.query(countQuery, countParams);

        res.status(200).json({
            status: 'success',
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count[0].total,
                totalPages: Math.ceil(count[0].total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.query(`
            SELECT p.*, pc.name as categoryName, pt.name as typeName
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            LEFT JOIN product_types pt ON p.typeId = pt.id
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];
        if (product.variations) {
            try {
                product.variations = JSON.parse(product.variations);
            } catch (e) {
                product.variations = [];
            }
        } else {
            product.variations = [];
        }
        // Parse gallery
        if (product.gallery) {
            try {
                product.gallery = JSON.parse(product.gallery);
            } catch (e) {
                product.gallery = [];
            }
        } else {
            product.gallery = [];
        }

        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const { title, categoryId, typeId, image, gallery, discountedPrice, pack, variations, isFeatured = 0, isActive = 1 } = req.body;

        if (!title || !categoryId || !typeId || !pack) {
            return res.status(400).json({ error: 'Title, categoryId, typeId, and pack are required' });
        }

        const variationsString = variations && Array.isArray(variations) ? JSON.stringify(variations) : null;
        const galleryString = gallery && Array.isArray(gallery) ? JSON.stringify(gallery) : null;

        const [result] = await db.query(
            'INSERT INTO products (title, categoryId, typeId, image, gallery, discountedPrice, pack, variations, isFeatured, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, categoryId, typeId, image, galleryString, discountedPrice, pack, variationsString, isFeatured, isActive]
        );

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully',
            data: { id: result.insertId, title, categoryId, typeId, image, gallery, discountedPrice, pack, variations, isFeatured, isActive }
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, categoryId, typeId, image, gallery, discountedPrice, pack, variations, isFeatured, isActive } = req.body;

        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (categoryId !== undefined) {
            updates.push('categoryId = ?');
            params.push(categoryId);
        }
        if (typeId !== undefined) {
            updates.push('typeId = ?');
            params.push(typeId);
        }
        if (image !== undefined) {
            updates.push('image = ?');
            params.push(image);
        }
        if (gallery !== undefined) {
            const galleryString = Array.isArray(gallery) ? JSON.stringify(gallery) : null;
            updates.push('gallery = ?');
            params.push(galleryString);
        }
        if (discountedPrice !== undefined) {
            updates.push('discountedPrice = ?');
            params.push(discountedPrice);
        }
        if (pack !== undefined) {
            updates.push('pack = ?');
            params.push(pack);
        }
        if (variations !== undefined) {
            const variationsString = Array.isArray(variations) ? JSON.stringify(variations) : null;
            updates.push('variations = ?');
            params.push(variationsString);
        }
        if (isFeatured !== undefined) {
            updates.push('isFeatured = ?');
            params.push(isFeatured);
        }
        if (isActive !== undefined) {
            updates.push('isActive = ?');
            params.push(isActive);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);
        const [result] = await db.query(
            `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully'
        });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive is required' });
        }

        const [result] = await db.query(
            'UPDATE products SET isActive = ? WHERE id = ?',
            [isActive, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Product status updated successfully'
        });
    } catch (err) {
        console.error('Error updating product status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
