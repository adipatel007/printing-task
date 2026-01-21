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
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTxt = req.query.searchTxt || '';
    const offset = (page - 1) * limit;

    console.log('getBrandUsers - req.userDetails:', req.userDetails);
    console.log('getBrandUsers - req.query.brandId:', req.query.brandId);
    console.log('getBrandUsers - isSuperAdmin check:', isSuperAdmin(req.userDetails));

    if (isSuperAdmin(req.userDetails)) {
      brandId = req.query.brandId;
    } else {
      brandId = req.userDetails && req.userDetails.brandId;
    }

    console.log('getBrandUsers - final brandId:', brandId);

    if (!brandId) {
      return res.status(400).json({ error: 'brandId is required' });
    }

    const result = await BrandUsers.getByBrand(brandId, limit, offset, searchTxt);
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
      roleId: body.roleId || null,
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

    console.log('updateBrandUser - id:', id);
    console.log('updateBrandUser - body:', body);
    console.log('updateBrandUser - body.roleId:', body.roleId);

    const brandScope = !isSuperAdmin(req.userDetails)
      ? { brandId: req.userDetails && req.userDetails.brandId }
      : null;

    const payload = {
      name: body.name,
      email: body.email,
      userType: body.userType || 'BRAND_USER',
      roleId: body.roleId,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined,
    };

    console.log('updateBrandUser - payload:', payload);

    if (body.password) {
      payload.password = body.password;
    }

    const result = await BrandUsers.updateUser(id, payload, brandScope);

    console.log('updateBrandUser - result:', result);

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

    const result = await BrandUsers.deleteUser(id, brandScope);

    if (result && result.data && result.data.affectedRows === 0) {
      return res.status(404).json({ error: 'Brand user not found' });
    }

    return res.status(200).json({ status: 'success', message: 'Brand user deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
