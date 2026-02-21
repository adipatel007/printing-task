const Vendors = require('../models/vendorsModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createVendor = async (req, res) => {
    try {
        const { name, email, password, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, isActive } = req.body;
        const brandId = req.userDetails.brandId;

        if (!name || !email || !brandId) {
            return res.status(400).json({ error: 'Name, email, and brandId are required' });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const result = await Vendors.create({ name, email, password: hashedPassword, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, brandId, isActive: isActive !== undefined ? isActive : 1 });
        res.status(201).json({ message: 'Vendor created', id: result.data.insertId });
    } catch (err) {
        console.error('Error creating vendor:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const results = await Vendors.getAll();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching vendors:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllVendorsByPage = async (req, res) => {
    try {
        const { limit = 10, page = 1, searchtxt = '' } = req.query;
        const brandId = req.userDetails.brandId;

        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }

        const results = await Vendors.getAllByPage(Number(limit), Number(page), searchtxt, brandId);

        res.status(200).json({
            status: 'success',
            data: results.data,
            totalCount: results.totalCount,
            totalPages: Math.ceil(results.totalCount / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching vendors:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Vendors.getById(id);
        if (!result.data) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching vendor:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, isActive } = req.body;

        const existingVendor = await Vendors.getById(id);
        if (!existingVendor.data) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        if (email && email !== existingVendor.data.email) {
            const emailCheck = await Vendors.getByEmail(email);
            if (emailCheck.data) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        const result = await Vendors.update(id, { name, email, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, isActive });
        res.status(200).json({ message: 'Vendor updated' });
    } catch (err) {
        console.error('Error updating vendor:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const existingVendor = await Vendors.getById(id);
        if (!existingVendor.data) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        await Vendors.delete(id);
        res.status(200).json({ message: 'Vendor deleted' });
    } catch (err) {
        console.error('Error deleting vendor:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const vendorResult = await Vendors.getByEmail(email);
        if (!vendorResult.data) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const vendor = vendorResult.data;

        if (!vendor.password) {
            return res.status(401).json({ error: 'No password set for this vendor. Please contact admin.' });
        }

        const isPasswordValid = await bcrypt.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (vendor.isActive !== 1) {
            return res.status(401).json({ error: 'Vendor account is inactive' });
        }

        const token = jwt.sign(
            { vendorId: vendor.id, email: vendor.email, brandId: vendor.brandId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        const { password: _, ...vendorWithoutPassword } = vendor;

        res.status(200).json({
            status: 'success',
            message: 'Vendor logged in successfully',
            token,
            vendor: vendorWithoutPassword
        });
    } catch (err) {
        console.error('Error in vendor login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.vendorDetails.id;

        const result = await Vendors.getById(vendorId);
        if (!result.data) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        const { password: _, ...vendorWithoutPassword } = result.data;

        res.status(200).json({
            status: 'success',
            vendor: vendorWithoutPassword
        });
    } catch (err) {
        console.error('Error fetching vendor profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateVendorProfile = async (req, res) => {
    try {
        const vendorId = req.vendorDetails.id;
        const { name, email, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment, currentPassword, newPassword } = req.body;

        const existingVendor = await Vendors.getById(vendorId);
        if (!existingVendor.data) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        let updateData = { name, email, mobile, companyName, gstNumber, panNumber, address, city, state, zipCode, country, bankName, accountNumber, ifscCode, servicesOffered, equipment };

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to change password' });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, existingVendor.data.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const result = await Vendors.update(vendorId, updateData);
        res.status(200).json({ message: 'Vendor profile updated successfully' });
    } catch (err) {
        console.error('Error updating vendor profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
