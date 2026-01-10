const Brands = require('../models/brandsModel');

exports.createBrand = async (req, res) => {
    try {
        console.log('Creating Brand:', req.body);
        const result = await Brands.create(req.body);
        console.log('Create Brand result:', result);
        if (result && result.data && result.data.insertId) {
            return res.status(201).json({
                status: 'success',
                message: 'Brand created successfully',
                id: result.data.insertId,
                brandCode: result.data.brandCode
            });
        } else {
            return res.status(500).json({ error: 'Failed to create Brand' });
        }
    } catch (err) {
        console.error('Error creating Brand:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.getAllBrands = async (req, res) => {
    try {
        const result = await Brands.getAll();
        return res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching Brands:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getBrandById = async (req, res) => {
    try {
        const id = req.params.id;
        const brand = await Brands.getById(id);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        return res.status(200).json({ status: 'success', data: brand });
    } catch (err) {
        console.error('Error fetching Brand:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Updating Brand:', id, req.body);
        const result = await Brands.update(id, req.body);
        console.log('Update Brand result:', result);
        if (result && result.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Brand updated successfully' });
        } else {
            return res.status(404).json({ error: 'Brand not found' });
        }
    } catch (err) {
        console.error('Error updating Brand:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.updateBrandStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { isActive } = req.body;
        console.log('Updating Brand Status:', id, isActive);
        const result = await Brands.updateStatus(id, isActive);
        console.log('Update Brand Status result:', result);
        if (result && result.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Brand status updated successfully' });
        } else {
            return res.status(404).json({ error: 'Brand not found' });
        }
    } catch (err) {
        console.error('Error updating Brand status:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Deleting Brand:', id);
        const result = await Brands.delete(id);
        console.log('Delete Brand result:', result);
        if (result && result.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Brand deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Brand not found' });
        }
    } catch (err) {
        console.error('Error deleting Brand:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// Public branding endpoint used by all panels via brandCode
exports.getBrandingByCode = async (req, res) => {
    try {
        const { brandCode } = req.params;
        const brand = await Brands.getByCode(brandCode);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        return res.status(200).json({
            status: 'success',
            data: {
                brandCode: brand.brandCode,
                brandName: brand.brandName,
                primaryColor: brand.primaryColor,
                whiteLogo: brand.whiteLogo,
                blackLogo: brand.blackLogo,
                domain: brand.domain || null
            }
        });
    } catch (err) {
        console.error('Error fetching Branding by code:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
