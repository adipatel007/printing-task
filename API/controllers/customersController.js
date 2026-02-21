const Customers = require('../models/customersModel');
const bcrypt = require('bcrypt');

exports.createCustomer = async (req, res) => {
    try {
        const { name, email, password, mobile, address, city, state, zipCode, country, isActive } = req.body;
        const brandId = req.userDetails.brandId;

        if (!name || !email || !brandId) {
            return res.status(400).json({ error: 'Name, email, and brandId are required' });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const result = await Customers.create({ name, email, password: hashedPassword, mobile, address, city, state, zipCode, country, brandId, isActive: isActive !== undefined ? isActive : 1 });
        res.status(201).json({ message: 'Customer created', id: result.data.insertId });
    } catch (err) {
        console.error('Error creating customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Public: check if a customer exists by email or mobile
exports.checkExists = async (req, res) => {
    try {
        const { email, mobile } = req.query;

        if (!email && !mobile) {
            return res.status(400).json({ error: 'Provide email or mobile to check' });
        }

        if (email) {
            const byEmail = await Customers.getByEmail(email);
            if (byEmail.data) {
                return res.status(200).json({ status: 'success', exists: true, field: 'email' });
            }
        }

        if (mobile) {
            const byMobile = await Customers.getByMobile(mobile);
            if (byMobile.data) {
                return res.status(200).json({ status: 'success', exists: true, field: 'mobile' });
            }
        }

        return res.status(200).json({ status: 'success', exists: false });
    } catch (err) {
        console.error('Error checking customer existence:', err);
        return res.status(500).json({ error: 'Internal server error' });
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
        const { name, email, password, mobile, address, city, state, zipCode, country, isActive } = req.body;

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

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const result = await Customers.update(id, { name, email, password: hashedPassword, mobile, address, city, state, zipCode, country, isActive });
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

exports.customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const customerResult = await Customers.getByEmail(email);
        if (!customerResult.data) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const customer = customerResult.data;
        const bcrypt = require('bcrypt');
        const isPasswordValid = await bcrypt.compare(password, customer.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: customer.id, type: 'Customer' },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        // Update customer token in database
        await db.execute('UPDATE customers SET token = ? WHERE id = ?', [token, customer.id]);

        const { password: _, token: __, ...customerData } = customer;

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                ...customerData,
                token
            }
        });
    } catch (err) {
        console.error('Error during customer login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.customerRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, mobile, address, city, state, zipCode, country, brandCode } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingCustomer = await Customers.getByEmail(email);
        if (existingCustomer.data) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        if (mobile) {
            const existingByMobile = await Customers.getByMobile(mobile);
            if (existingByMobile.data) {
                return res.status(400).json({ error: 'Mobile already registered' });
            }
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const name = `${firstName} ${lastName}`;

        let brandId = null;
        if (brandCode) {
            const Brands = require('../models/brandsModel');
            const brand = await Brands.getByCode(brandCode);
            if (brand && brand.id) {
                brandId = brand.id;
            } else {
                return res.status(400).json({ error: 'Invalid brandCode' });
            }
        } else {
            return res.status(400).json({ error: 'brandCode is required' });
        }

        const newCustomer = {
            name,
            email,
            mobile: mobile || '',
            password: hashedPassword,
            address: address || '',
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            country: country || '',
            brandId,
            isActive: true
        };

        const result = await Customers.create(newCustomer);

        if (result && result.data && result.data.insertId) {
            const { password: _, ...customerData } = { ...newCustomer, id: result.data.insertId };

            res.status(201).json({
                status: 'success',
                message: 'Registration successful',
                data: customerData
            });
        } else {
            res.status(500).json({ error: 'Failed to create customer' });
        }
    } catch (err) {
        console.error('Error during customer registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};