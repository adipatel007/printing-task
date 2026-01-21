const BrandConfig = require('../models/brandConfigModel');

exports.getBrandConfigByAuth = async (req, res) => {
    try {
        const brandId = req.userDetails.brandId;
        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }
        const results = await BrandConfig.getByBrand(brandId);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Brand Config:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateBrandConfigByAuth = async (req, res) => {
    try {
        const brandId = req.userDetails.brandId;
        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }

        const brandConfig = await BrandConfig.getByBrand(brandId);
        if (!brandConfig || !brandConfig.data) {
            return res.status(404).json({ error: 'Brand config not found' });
        }

        const configId = brandConfig.data.id;
        const result = await BrandConfig.update(configId, req.body);

        if (result && result.data && result.data.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Brand config updated successfully' });
        }

        return res.status(404).json({ error: 'Brand config not found' });
    } catch (err) {
        console.error('Error updating Brand Config:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
