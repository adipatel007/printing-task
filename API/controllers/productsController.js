const Products = require('../models/productsModel');
const db = require('../config/db');

// Product Categories
exports.getAllCategories = async (req, res) => {
    try {
        const query = 'SELECT * FROM product_categories WHERE isActive = 1 ORDER BY sortOrder';
        const [categories] = await db.query(query);
        res.status(200).json({ status: 'success', data: categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, icon, sortOrder } = req.body;
        const query = 'INSERT INTO product_categories (name, description, icon, sortOrder, isActive) VALUES (?, ?, ?, ?, 1)';
        const [result] = await db.query(query, [name, description, icon, sortOrder]);
        res.status(201).json({ status: 'success', message: 'Category created', id: result.insertId });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, sortOrder, isActive } = req.body;
        const query = 'UPDATE product_categories SET name = ?, description = ?, icon = ?, sortOrder = ?, isActive = ? WHERE id = ?';
        await db.query(query, [name, description, icon, sortOrder, isActive, id]);
        res.status(200).json({ status: 'success', message: 'Category updated' });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'UPDATE product_categories SET isActive = 0 WHERE id = ?';
        await db.query(query, [id]);
        res.status(200).json({ status: 'success', message: 'Category deleted' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Products
exports.createProduct = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { name, description, categoryId, images, sizes, materials, paperTypes, pricingRules, basePrice, moq, deliveryDays, allowDesignUpload, allowOnlineDesign, maxUploadSizeMB, supportedFormats } = req.body;
        const createdBy = req.userDetails?.id || req.userDetails?.vendorId || req.userDetails?.adminId;

        if (!name || !categoryId || !basePrice) {
            return res.status(400).json({ error: 'Name, category, and base price are required' });
        }

        // Create product
        const [productResult] = await connection.query(
            'INSERT INTO products (name, description, categoryId, basePrice, moq, deliveryDays, allowDesignUpload, allowOnlineDesign, maxUploadSizeMB, supportedFormats, createdBy, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
            [name, description, categoryId, basePrice, moq || 1, deliveryDays || 7, allowDesignUpload || true, allowOnlineDesign || false, maxUploadSizeMB || 10, JSON.stringify(supportedFormats || []), createdBy]
        );

        const productId = productResult.insertId;

        // Insert images
        if (images && images.length) {
            for (let i = 0; i < images.length; i++) {
                await connection.query(
                    'INSERT INTO product_images (productId, image, sortOrder) VALUES (?, ?, ?)',
                    [productId, images[i], i]
                );
            }
        }

        // Insert sizes
        if (sizes && sizes.length) {
            for (const size of sizes) {
                await connection.query(
                    'INSERT INTO product_sizes (productId, name, width, height, unit, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [productId, size.name, size.width, size.height, size.unit || 'mm', size.priceAdjustment || 0, size.sortOrder || 0]
                );
            }
        }

        // Insert materials
        if (materials && materials.length) {
            for (const material of materials) {
                await connection.query(
                    'INSERT INTO product_materials (productId, name, gsm, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?, ?)',
                    [productId, material.name, material.gsm, material.priceAdjustment || 0, material.sortOrder || 0]
                );
            }
        }

        // Insert paper types
        if (paperTypes && paperTypes.length) {
            for (const paperType of paperTypes) {
                await connection.query(
                    'INSERT INTO product_paper_types (productId, name, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?)',
                    [productId, paperType.name, paperType.priceAdjustment || 0, paperType.sortOrder || 0]
                );
            }
        }

        // Insert pricing rules
        if (pricingRules && pricingRules.length) {
            for (const rule of pricingRules) {
                await connection.query(
                    'INSERT INTO product_pricing_rules (productId, minQuantity, maxQuantity, pricePerUnit, discountPercent) VALUES (?, ?, ?, ?, ?)',
                    [productId, rule.minQuantity, rule.maxQuantity || null, rule.pricePerUnit, rule.discountPercent || 0]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ status: 'success', message: 'Product created', id: productId });
    } catch (err) {
        await connection.rollback();
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { categoryId, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, pc.name as categoryName,
                (SELECT image FROM product_images WHERE productId = p.id LIMIT 1) as thumbnail
            FROM products p
            LEFT JOIN product_categories pc ON p.categoryId = pc.id
            WHERE p.isActive = 1
        `;
        const params = [];

        if (categoryId) {
            query += ' AND p.categoryId = ?';
            params.push(categoryId);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.isActive = 1';
        const countParams = [];
        if (categoryId) {
            countQuery += ' AND p.categoryId = ?';
            countParams.push(categoryId);
        }
        if (search) {
            countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
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

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get product
        const [products] = await db.query(
            'SELECT p.*, pc.name as categoryName FROM products p LEFT JOIN product_categories pc ON p.categoryId = pc.id WHERE p.id = ?',
            [id]
        );

        if (!products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];

        // Get product images
        const [images] = await db.query('SELECT * FROM product_images WHERE productId = ? ORDER BY sortOrder', [id]);

        // Get sizes
        const [sizes] = await db.query('SELECT * FROM product_sizes WHERE productId = ? ORDER BY sortOrder', [id]);

        // Get materials
        const [materials] = await db.query('SELECT * FROM product_materials WHERE productId = ? ORDER BY sortOrder', [id]);

        // Get paper types
        const [paperTypes] = await db.query('SELECT * FROM product_paper_types WHERE productId = ? ORDER BY sortOrder', [id]);

        // Get pricing rules
        const [pricingRules] = await db.query('SELECT * FROM product_pricing_rules WHERE productId = ? ORDER BY minQuantity', [id]);

        res.status(200).json({
            status: 'success',
            data: {
                ...product,
                images,
                sizes,
                materials,
                paperTypes,
                pricingRules
            }
        });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProduct = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { name, description, categoryId, images, sizes, materials, paperTypes, pricingRules, basePrice, moq, deliveryDays, allowDesignUpload, allowOnlineDesign, maxUploadSizeMB, supportedFormats } = req.body;

        // Update product
        await connection.query(
            'UPDATE products SET name = ?, description = ?, categoryId = ?, basePrice = ?, moq = ?, deliveryDays = ?, allowDesignUpload = ?, allowOnlineDesign = ?, maxUploadSizeMB = ?, supportedFormats = ? WHERE id = ?',
            [name, description, categoryId, basePrice, moq, deliveryDays, allowDesignUpload, allowOnlineDesign, maxUploadSizeMB, JSON.stringify(supportedFormats || []), id]
        );

        // Delete and re-insert images
        await connection.query('DELETE FROM product_images WHERE productId = ?', [id]);
        if (images && images.length) {
            for (let i = 0; i < images.length; i++) {
                await connection.query(
                    'INSERT INTO product_images (productId, image, sortOrder) VALUES (?, ?, ?)',
                    [id, images[i], i]
                );
            }
        }

        // Delete and re-insert sizes
        await connection.query('DELETE FROM product_sizes WHERE productId = ?', [id]);
        if (sizes && sizes.length) {
            for (const size of sizes) {
                await connection.query(
                    'INSERT INTO product_sizes (productId, name, width, height, unit, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id, size.name, size.width, size.height, size.unit || 'mm', size.priceAdjustment || 0, size.sortOrder || 0]
                );
            }
        }

        // Delete and re-insert materials
        await connection.query('DELETE FROM product_materials WHERE productId = ?', [id]);
        if (materials && materials.length) {
            for (const material of materials) {
                await connection.query(
                    'INSERT INTO product_materials (productId, name, gsm, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?, ?)',
                    [id, material.name, material.gsm, material.priceAdjustment || 0, material.sortOrder || 0]
                );
            }
        }

        // Delete and re-insert paper types
        await connection.query('DELETE FROM product_paper_types WHERE productId = ?', [id]);
        if (paperTypes && paperTypes.length) {
            for (const paperType of paperTypes) {
                await connection.query(
                    'INSERT INTO product_paper_types (productId, name, priceAdjustment, sortOrder) VALUES (?, ?, ?, ?)',
                    [id, paperType.name, paperType.priceAdjustment || 0, paperType.sortOrder || 0]
                );
            }
        }

        // Delete and re-insert pricing rules
        await connection.query('DELETE FROM product_pricing_rules WHERE productId = ?', [id]);
        if (pricingRules && pricingRules.length) {
            for (const rule of pricingRules) {
                await connection.query(
                    'INSERT INTO product_pricing_rules (productId, minQuantity, maxQuantity, pricePerUnit, discountPercent) VALUES (?, ?, ?, ?, ?)',
                    [id, rule.minQuantity, rule.maxQuantity || null, rule.pricePerUnit, rule.discountPercent || 0]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ status: 'success', message: 'Product updated' });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE products SET isActive = 0 WHERE id = ?', [id]);
        res.status(200).json({ status: 'success', message: 'Product deleted' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Calculate price based on selections
exports.calculatePrice = async (req, res) => {
    try {
        const { productId, sizeId, materialId, paperTypeId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        // Get product
        const [products] = await db.query(
            'SELECT * FROM products WHERE id = ? AND isActive = 1',
            [productId]
        );

        if (!products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];
        let pricePerUnit = product.basePrice;

        // Add size price adjustment
        if (sizeId) {
            const [sizes] = await db.query(
                'SELECT priceAdjustment FROM product_sizes WHERE id = ? AND productId = ?',
                [sizeId, productId]
            );
            if (sizes.length) {
                pricePerUnit += sizes[0].priceAdjustment;
            }
        }

        // Add material price adjustment
        if (materialId) {
            const [materials] = await db.query(
                'SELECT priceAdjustment FROM product_materials WHERE id = ? AND productId = ?',
                [materialId, productId]
            );
            if (materials.length) {
                pricePerUnit += materials[0].priceAdjustment;
            }
        }

        // Add paper type price adjustment
        if (paperTypeId) {
            const [paperTypes] = await db.query(
                'SELECT priceAdjustment FROM product_paper_types WHERE id = ? AND productId = ?',
                [paperTypeId, productId]
            );
            if (paperTypes.length) {
                pricePerUnit += paperTypes[0].priceAdjustment;
            }
        }

        // Apply pricing rules based on quantity
        const [pricingRules] = await db.query(
            'SELECT * FROM product_pricing_rules WHERE productId = ? ORDER BY minQuantity',
            [productId]
        );

        for (const rule of pricingRules) {
            if (quantity >= rule.minQuantity && (!rule.maxQuantity || quantity <= rule.maxQuantity)) {
                pricePerUnit = rule.pricePerUnit;
                if (rule.discountPercent > 0) {
                    pricePerUnit = pricePerUnit * (1 - rule.discountPercent / 100);
                }
                break;
            }
        }

        const totalPrice = pricePerUnit * quantity;

        res.status(200).json({
            status: 'success',
            data: {
                pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                quantity
            }
        });
    } catch (err) {
        console.error('Error calculating price:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
