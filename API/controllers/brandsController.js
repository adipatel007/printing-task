const Brands = require('../models/brandsModel');
const BrandConfig = require('../models/brandConfigModel');

exports.createBrand = async (req, res) => {
    try {
        console.log('Creating Brand:', req.body);

        // Extract brand-specific config fields from request body
        const brandConfigData = {
            whiteLogo: req.body.whiteLogo || '',
            blackLogo: req.body.blackLogo || '',
            primaryColor: req.body.primaryColor || '',
            mobile: req.body.mobile || '',
            email: req.body.email || '',
            domain: req.body.domain || ''
        };

        // Remove these fields from brand creation data
        const brandData = { ...req.body };
        delete brandData.whiteLogo;
        delete brandData.blackLogo;
        delete brandData.primaryColor;
        delete brandData.mobile;
        delete brandData.email;
        delete brandData.domain;

        const result = await Brands.create(brandData);
        console.log('Create Brand result:', result);

        if (result && result.data && result.data.insertId) {
            const brandId = result.data.insertId;

            const Siteconfigs = require('../models/siteconfigModel');
            const siteconfigs = await Siteconfigs.getAll();

            let logo = '';
            let primaryColor = '';

            if (siteconfigs && siteconfigs.data && siteconfigs.data.length > 0) {
                const superAdminConfig = siteconfigs.data[0];
                logo = superAdminConfig.logo || '';
                primaryColor = superAdminConfig.primaryColor || '';
            }

            await BrandConfig.create({
                brandId: brandId,
                logo: logo,
                whiteLogo: brandConfigData.whiteLogo,
                blackLogo: brandConfigData.blackLogo,
                primaryColor: brandConfigData.primaryColor || primaryColor,
                twitterURL: '',
                youtubeURL: '',
                instagramURL: '',
                facebookURL: '',
                mobile: brandConfigData.mobile,
                email: brandConfigData.email,
                domain: brandConfigData.domain
            });

            console.log('Brand config created for brandId:', brandId);

            return res.status(201).json({
                status: 'success',
                message: 'Brand created successfully',
                id: brandId,
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

exports.getBrandingByCode = async (req, res) => {
    try {
        const { brandCode } = req.params;
        const brand = await Brands.getByCode(brandCode);
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        // Get brand config from brand_config table
        const brandConfig = await BrandConfig.getByBrand(brand.id);
        if (!brandConfig || !brandConfig.data) {
            return res.status(404).json({ error: 'Brand config not found' });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                brandCode: brand.brandCode,
                brandName: brand.brandName,
                whiteLogo: brandConfig.data.whiteLogo || '',
                blackLogo: brandConfig.data.blackLogo || '',
                primaryColor: brandConfig.data.primaryColor || '',
                mobile: brandConfig.data.mobile || '',
                email: brandConfig.data.email || '',
                address: brandConfig.data.address || '',
                domain: brandConfig.data.domain || null
            }
        });
    } catch (err) {
        console.error('Error fetching Branding by code:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};