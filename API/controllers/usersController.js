const jwt = require("jsonwebtoken");
const axios = require('axios');
const Users = require('../models/usersModel');
const Pagecategorys = require('../models/pagescategoryModel');

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
        const { email, password } = req.body;

        const user = await Users.findByEmail(email);
        if (!user || !user.data) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (password !== user.data.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isActive = await Users.getUserStatus(user.data.id);
        if (!isActive) {
            return res.status(403).json({ error: 'User is Inactive' });
        }

        let token;
        if (user.data) {
            token = jwt.sign({ id: user.data.id, type: 'Administrator User', userType: user.data.userType, brandId: user.data.brandId }, process.env.JWT_KEY);
            await Users.updateUserToken(user.data.id, token);
        }

        if (!user.data.roleId) {
            return res.status(403).json({ error: 'No role assigned to the user' });
        }

        const permissions = await Users.getPermissionsByRoleId(user.data.roleId);

        if (!permissions || permissions.length === 0) {
            return res.status(403).json({ error: 'No permissions assigned to the user\'s role' });
        }



        const pages = await Users.getPagesByPermissionIds(permissions, user);

        const pageCategories = await Pagecategorys.getAll();
        let filterPageCategories = pageCategories.data.sort(function (a, b) {
            return a.displayOrder - b.displayOrder;
        });

        const groupedPages = filterPageCategories.reduce((acc, pageCategory) => {
            const categoryId = pageCategory.id;
            acc[pageCategory.name] = acc[categoryId] || { category: pageCategory.name, pages: [] };
            const pagesInCategory = pages.filter(page => page.categoryId === categoryId).sort(function (a, b) {
                return a.displayorder - b.displayorder;
            });
            acc[pageCategory.name].pages.push(...pagesInCategory);
            return acc;
        }, {});

        const groupedPagesArray = Object.values(groupedPages);

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