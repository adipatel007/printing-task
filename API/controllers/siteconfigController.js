const Siteconfigs = require('../models/siteconfigModel');

exports.createSiteconfig = async (req, res) => {
    try {
        const result = await Siteconfigs.create(req.body);
        res.status(201).json({ message: 'Siteconfig created', id: result.insertId });
    } catch (err) {
        console.error('Error creating Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createSiteconfigByAuth = async (req, res) => {
    try {
        const brandId = req.userDetails.brandId;
        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }
        const data = { ...req.body, brandId };
        const result = await Siteconfigs.create(data);
        res.status(201).json({ message: 'Siteconfig created', id: result.insertId });
    } catch (err) {
        console.error('Error creating Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllSiteconfigs = async (req, res) => {
    try {
        const results = await Siteconfigs.getAll();
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Siteconfigs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSiteconfigByAuth = async (req, res) => {
    try {
        const brandId = req.userDetails?.brandId;
        if (!brandId) {
            const results = await Siteconfigs.getAll();
            return res.status(200).json(results);
        }
        const results = await Siteconfigs.getByBrand(brandId);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching Siteconfigs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSiteconfig = async (req, res) => {
    const id = req.params.id;
    try {
        console.log('Updating SiteConfig:', id, req.body);
        const result = await Siteconfigs.update(id, req.body, req.userDetails);
        console.log('Update SiteConfig result:', result);

        const affectedRows = result && result.data && typeof result.data.affectedRows === 'number'
            ? result.data.affectedRows 
            : 0;

        if (affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Siteconfig updated successfully' });
        }

        return res.status(404).json({ error: 'Siteconfig not found' });
    } catch (err) {
        console.error('Error updating Siteconfig:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.updateSiteconfigByAuth = async (req, res) => {
    const id = req.params.id;
    try {
        const brandId = req.userDetails.brandId;
        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }

        const siteconfig = await Siteconfigs.getById(id);
        if (!siteconfig) {
            return res.status(404).json({ error: 'Siteconfig not found' });
        }

        if (siteconfig.brandId !== brandId) {
            return res.status(403).json({ error: 'You do not have permission to update this siteconfig' });
        }

        const result = await Siteconfigs.update(id, req.body);
        res.status(200).json({ status: 'success', message: 'Siteconfig updated successfully' });
    } catch (err) {
        console.error('Error updating Siteconfig:', err);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.deleteSiteconfig = async (req, res) => {
    const id = req.params.id;
    try {
        await Siteconfigs.delete(id);
        res.status(200).json({ message: 'Siteconfig deleted' });
    } catch (err) {
        console.error('Error deleting Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteSiteconfigByAuth = async (req, res) => {
    const id = req.params.id;
    try {
        const brandId = req.userDetails.brandId;
        if (!brandId) {
            return res.status(400).json({ error: 'Brand ID not found in user details' });
        }

        const siteconfig = await Siteconfigs.getById(id);
        if (!siteconfig) {
            return res.status(404).json({ error: 'Siteconfig not found' });
        }

        if (siteconfig.brandId !== brandId) {
            return res.status(403).json({ error: 'You do not have permission to delete this siteconfig' });
        }

        await Siteconfigs.delete(id);
        res.status(200).json({ message: 'Siteconfig deleted' });
    } catch (err) {
        console.error('Error deleting Siteconfig:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};