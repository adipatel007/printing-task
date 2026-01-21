const Customers = require('../models/customersModel');

exports.createCustomer = async (req, res) => {
    try {
        const { name, email, mobile, address, city, state, zipCode, country, isActive } = req.body;
        const brandId = req.userDetails.brandId;

        if (!name || !email || !brandId) {
            return res.status(400).json({ error: 'Name, email, and brandId are required' });
        }

        const result = await Customers.create({ name, email, mobile, address, city, state, zipCode, country, brandId, isActive: isActive !== undefined ? isActive : 1 });
        res.status(201).json({ message: 'Customer created', id: result.data.insertId });
    } catch (err) {
        console.error('Error creating customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const results = await Customers.getAll();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllCustomersByPage = async (req, res) => {
    try {
        const { limit = 10, page = 1, searchtxt = '' } = req.query;
        const brandId = req.userDetails.brandId;

        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }

        const results = await Customers.getAllByPage(Number(limit), Number(page), searchtxt, brandId);

        res.status(200).json({
            status: 'success',
            data: results.data,
            totalCount: results.totalCount,
            totalPages: Math.ceil(results.totalCount / limit),
            currentPage: page
        });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Customers.getById(id);
        if (!result.data) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobile, address, city, state, zipCode, country, isActive } = req.body;

        const existingCustomer = await Customers.getById(id);
        if (!existingCustomer.data) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (email && email !== existingCustomer.data.email) {
            const emailCheck = await Customers.getByEmail(email);
            if (emailCheck.data) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        const result = await Customers.update(id, { name, email, mobile, address, city, state, zipCode, country, isActive });
        res.status(200).json({ message: 'Customer updated' });
    } catch (err) {
        console.error('Error updating customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const existingCustomer = await Customers.getById(id);
        if (!existingCustomer.data) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        await Customers.delete(id);
        res.status(200).json({ message: 'Customer deleted' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
