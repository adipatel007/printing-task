const BrandRoles = require('../models/brandRolesModel');

exports.getAllBrandRoles = async (req, res) => {
  try {
    const results = await BrandRoles.getAll();
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching brand roles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrandRolesByBrand = async (req, res) => {
  try {
    const results = await BrandRoles.getByBrand(req.params.brandId);
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching brand roles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrandRolesByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }
    const results = await BrandRoles.getByBrand(brandId);
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching brand roles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrandRoleById = async (req, res) => {
  try {
    const role = await BrandRoles.getById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Brand role not found' });
    }
    res.status(200).json({
      status: 'success',
      data: role
    });
  } catch (err) {
    console.error('Error fetching brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBrandRole = async (req, res) => {
  try {
    const result = await BrandRoles.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Brand role created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBrandRoleByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }
    const roleData = {
      ...req.body,
      brandId: brandId
    };
    const result = await BrandRoles.create(roleData);
    res.status(201).json({
      status: 'success',
      message: 'Brand role created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBrandRole = async (req, res) => {
  try {
    const results = await BrandRoles.update(req.params.id, req.body);
    if (results && results.affectedRows > 0) {
      res.status(200).json({ status: 'success', message: 'Brand role updated successfully' });
    } else {
      res.status(404).json({ error: 'Brand role not found' });
    }
  } catch (err) {
    console.error('Error updating brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBrandRoleByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }
    const role = await BrandRoles.getById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Brand role not found' });
    }
    if (role.brandId !== brandId) {
      return res.status(403).json({ error: 'You do not have permission to update this role' });
    }
    const results = await BrandRoles.update(req.params.id, req.body);
    if (results && results.affectedRows > 0) {
      res.status(200).json({ status: 'success', message: 'Brand role updated successfully' });
    } else {
      res.status(404).json({ error: 'Brand role not found' });
    }
  } catch (err) {
    console.error('Error updating brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBrandRole = async (req, res) => {
  try {
    await BrandRoles.delete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Brand role deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBrandRoleByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }
    const role = await BrandRoles.getById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Brand role not found' });
    }
    if (role.brandId !== brandId) {
      return res.status(403).json({ error: 'You do not have permission to delete this role' });
    }
    await BrandRoles.delete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Brand role deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
