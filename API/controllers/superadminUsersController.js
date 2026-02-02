const jwt = require("jsonwebtoken");
const SuperAdminUsers = require('../models/superadminUsersModel');

exports.createSuperAdminUser = async (req, res) => {
    try {
        const result = await SuperAdminUsers.create(req.body);
        if (result && result.insertId) {
            res.status(201).json({ status: 'success', message: 'Super Admin User created', id: result.insertId });
        } else {
            res.status(500).json({ error: 'Failed to create Super Admin User' });
        }
    } catch (err) {
        console.error('Error creating Super Admin User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllSuperAdminUsers = async (req, res) => {
    try {
        const results = await SuperAdminUsers.getAll();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Super Admin Users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllSuperAdminUsersByPage = async (req, res) => {
    try {
        const { limit = 10, page = 1, searchtxt = '' } = req.query;
        const results = await SuperAdminUsers.getAllByPage(Number(limit), Number(page), searchtxt);
        res.status(200).json({
            status: 'success',
            data: results.data,
            totalCount: results.totalCount,
            totalPages: Math.ceil(results.totalCount / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching Super Admin Users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSuperAdminUserById = async (req, res) => {
    try {
        const result = await SuperAdminUsers.findById(req.params.id);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({ error: 'Super Admin User not found' });
        }
    } catch (err) {
        console.error('Error fetching Super Admin User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSuperAdminUser = async (req, res) => {
    const id = req.params.id;
    try {
        const results = await SuperAdminUsers.update(id, req.body);
        if (results && results.affectedRows > 0) {
            res.status(200).json({ status: 'success', message: 'Super Admin User updated successfully' });
        } else {
            res.status(404).json({ error: 'Super Admin User not found' });
        }
    } catch (err) {
        console.error('Error updating Super Admin User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSuperAdminUserStatus = async (req, res) => {
    const id = req.params.id;
    const { isActive } = req.body;
    try {
        console.log('Updating Super Admin User Status:', id, isActive);
        const result = await SuperAdminUsers.updateStatus(id, isActive);
        console.log('Update status result:', result);
        if (result && result.affectedRows > 0) {
            res.status(200).json({ status: 'success', message: 'Super Admin User Status updated' });
        } else {
            res.status(404).json({ error: 'Super Admin User not found' });
        }
    } catch (err) {
        console.error('Error updating Super Admin User Status:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.deleteSuperAdminUser = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await SuperAdminUsers.delete(id);
        if (result && result.affectedRows > 0) {
            res.status(200).json({ status: 'success', message: 'Super Admin User deleted' });
        } else {
            res.status(404).json({ error: 'Super Admin User not found' });
        }
    } catch (err) {
        console.error('Error deleting Super Admin User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await SuperAdminUsers.findByEmail(email);
        if (!user || !user.data) {
            return res.status(404).json({ error: 'Super Admin User not found' });
        }

        if (password !== user.data.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isActive = await SuperAdminUsers.getUserStatus(user.data.id);
        if (!isActive) {
            return res.status(403).json({ error: 'Super Admin User is Inactive' });
        }

        let token;
        if (user.data) {
            token = jwt.sign({ id: user.data.id, type: 'Super Administrator User', userType: 'SUPER_ADMIN' }, process.env.JWT_KEY);
            await SuperAdminUsers.updateUserToken(user.data.id, token);
        }

        res.status(200).json({
            message: 'Login successful',
            user: user.data,
            token: token
        });

    } catch (err) {
        console.error('Error logging in Super Admin User:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
