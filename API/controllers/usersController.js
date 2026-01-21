const jwt = require("jsonwebtoken");
const axios = require('axios');
const Users = require('../models/usersModel');
const PageCategories = require('../models/pageCategoriesModel');

exports.createUser = async (req, res) => {
    try {
        const result = await Users.create(req.body);
        res.status(201).json({ message: 'User created', id: result.insertId });
    } catch (err) {
        console.error('Error creating User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const results = await Users.getAll();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllUsersByPage = async (req, res) => {
    try {
        const { limit = 10, page = 1, searchtxt = '' } = req.query;

        const results = await Users.getAllByPage(Number(limit), Number(page), searchtxt);

        res.status(200).json({
            status: 'success',
            data: results.data,
            totalCount: results.totalCount,
            totalPages: Math.ceil(results.totalCount / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching Users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUser = async (req, res) => {
    const id = req.params.id;
    try {
        const results = await Users.update(id, req.body);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error updating User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    const id = req.params.id;
    const { isActive } = req.body;
    try {
        await Users.updateUserStatus(id, isActive);
        res.status(200).json({ message: 'User Status updated' });
    } catch (err) {
        console.error('Error updating User Status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await Users.delete(id, req.userDetails);
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        console.error('Error deleting User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password, brandCode } = req.body;

        console.log('Login request:', { email, brandCode });

        const user = await Users.findByEmail(email);
        if (!user || !user.data) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User found:', { id: user.data.id, brandId: user.data.brandId, userType: user.data.userType, roleId: user.data.roleId });

        if (password !== user.data.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isActive = await Users.getUserStatus(user.data.id);
        if (!isActive) {
            return res.status(403).json({ error: 'User is Inactive' });
        }

        // Validate brandCode if provided
        if (brandCode) {
            const Brands = require('../models/brandsModel');
            const brand = await Brands.getByCode(brandCode);
            console.log('Brand found for brandCode:', brandCode, brand);
            
            if (!brand) {
                return res.status(400).json({ error: 'Invalid brand code' });
            }
            console.log('Brand validation:', { userBrandId: user.data.brandId, brandId: brand.id });
            
            // If user has null brandId, update it with the brandId from brandCode
            if (user.data.brandId === null || user.data.brandId === undefined) {
                console.log('Updating user brandId from null to:', brand.id);
                await Users.update(user.data.id, { brandId: brand.id });
                user.data.brandId = brand.id;
            }
            
            if (user.data.brandId !== brand.id) {
                return res.status(403).json({ error: 'You are not authorized to login for this brand' });
            }
        }

        let token;
        if (user.data) {
            token = jwt.sign({ id: user.data.id, type: 'Administrator User', userType: user.data.userType, brandId: user.data.brandId }, process.env.JWT_KEY);
            await Users.updateUserToken(user.data.id, token);
        }

        if (!user.data.roleId) {
            console.log('No roleId assigned to user:', user.data.id);
            return res.status(403).json({ error: 'No role assigned to the user' });
        }

        console.log('User roleId:', user.data.roleId);
        const permissions = await Users.getPermissionsByRoleId(user.data.roleId);
        console.log('Permissions found:', permissions);
        console.log('Permissions count:', permissions ? permissions.length : 0);

        if (!permissions || permissions.length === 0) {
            console.log('No permissions for roleId:', user.data.roleId);
            console.log('Checking permissions table directly...');
            try {
                const [allPerms] = await require('../config/db').execute('SELECT * FROM permissions WHERE roleId = ?', [user.data.roleId]);
                console.log('Direct query result:', allPerms);
            } catch(e) {
                console.error('Direct query error:', e);
            }
            return res.status(403).json({ error: 'No permissions assigned to the user\'s role' });
        }

        const pages = await Users.getPagesByPermissionIds(permissions, user);
        console.log('Pages found:', pages);
        console.log('Pages count:', pages.length);

        // Use unified page_categories table for page categories
        const pageCategories = await PageCategories.getAll();
        console.log('Page categories:', pageCategories.data);

        // Map categoryId -> categoryName for quick lookup
        const categoryMap = pageCategories.data.reduce((acc, cat) => {
            acc[cat.id] = cat.name;
            return acc;
        }, {});

        // Group directly by pages so that every permitted page is included
        const groupedPages = pages.reduce((acc, page) => {
            const categoryId = page.categoryId;
            const categoryName = categoryMap[categoryId] || 'Uncategorized';

            if (!acc[categoryName]) {
                acc[categoryName] = { category: categoryName, pages: [] };
            }

            acc[categoryName].pages.push(page);
            return acc;
        }, {});

        // Sort pages inside each category by displayorder
        Object.values(groupedPages).forEach(group => {
            group.pages.sort((a, b) => a.displayorder - b.displayorder);
        });

        console.log('Grouped pages:', groupedPages);

        const groupedPagesArray = Object.values(groupedPages);
        console.log('Grouped pages array:', groupedPagesArray);

        res.status(200).json({
            message: 'Login successful',
            user: user.data,
            userType: user.data.userType,
            brandId: user.data.brandId,
            token: token,
            pages: groupedPagesArray
        });

    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};