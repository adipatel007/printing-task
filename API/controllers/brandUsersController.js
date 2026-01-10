const BrandUsers = require('../models/brandUsersModel');

// Helper to detect if current user is super admin by userType
function isSuperAdmin(userDetails) {
  if (!userDetails) return false;
  // adjust condition based on your actual userType values
  return userDetails.userType === 'SUPER_ADMIN' || userDetails.userType === 'Super Admin';
}

exports.getBrandUsers = async (req, res) => {
  try {
    let brandId;

    if (isSuperAdmin(req.userDetails)) {
      // Super admin can pass any brandId via query
      brandId = req.query.brandId;
    } else {
      // Admin: brandId comes from token
      brandId = req.userDetails && req.userDetails.brandId;
    }

    if (!brandId) {
      return res.status(400).json({ error: 'brandId is required' });
    }

    const result = await BrandUsers.getByBrand(brandId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching brand users:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBrandUser = async (req, res) => {
  try {
    const body = req.body || {};
    let brandId = body.brandId;

    if (!isSuperAdmin(req.userDetails)) {
      // Admin: enforce brandId from token
      brandId = req.userDetails && req.userDetails.brandId;
    }

    if (!brandId) {
      return res.status(400).json({ error: 'brandId is required' });
    }

    const payload = {
      name: body.name,
      email: body.email,
      password: body.password,
      userType: body.userType || 'BRAND_USER',
      brandId,
      isActive: body.isActive ?? 1,
    };

    const result = await BrandUsers.createForBrand(payload);
    return res.status(201).json({ status: 'success', message: 'Brand user created successfully', data: result.data });
  } catch (err) {
    console.error('Error creating brand user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBrandUser = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const brandScope = !isSuperAdmin(req.userDetails)
      ? { brandId: req.userDetails && req.userDetails.brandId }
      : null;

    const payload = {
      name: body.name,
      email: body.email,
      userType: body.userType || 'BRAND_USER',
      isActive: body.isActive,
      password: body.password, // optional
    };

    const result = await BrandUsers.updateUser(id, payload, brandScope);

    if (result && result.data && result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Brand user not found' });
    }

    return res.status(200).json({ status: 'success', message: 'Brand user updated successfully' });
  } catch (err) {
    console.error('Error updating brand user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBrandUser = async (req, res) => {
  try {
    const id = req.params.id;

    const brandScope = !isSuperAdmin(req.userDetails)
      ? { brandId: req.userDetails && req.userDetails.brandId }
      : null;

    const result = await BrandUsers.deactivateUser(id, brandScope);

    if (result && result.data && result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Brand user not found' });
    }

    return res.status(200).json({ status: 'success', message: 'Brand user deactivated successfully' });
  } catch (err) {
    console.error('Error deleting brand user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
