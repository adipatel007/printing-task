const BrandPermissions = require('../models/brandPermissionsModel');
const BrandRoles = require('../models/brandRolesModel');

exports.getAllBrandPermissions = async (req, res) => {
  try {
    const results = await BrandPermissions.getAll();
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching brand permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPermissionsByRole = async (req, res) => {
  try {
    const results = await BrandPermissions.getByRole(req.params.roleId);
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPermissionsByRoleByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    const roleId = req.params.roleId;
    const userType = req.userDetails.userType;
    const type = req.userDetails.type;

    console.log('getPermissionsByRoleByAuth - userDetails:', {
      brandId,
      roleId,
      userType,
      type
    });

    // SUPER ADMIN can access any role's permissions without brandId check
    if (userType === 'Super Admin' || type === 'Super Administrator User') {
      console.log('SUPER ADMIN access granted');
      const results = await BrandPermissions.getByRole(roleId);
      return res.status(200).json({
        status: 'success',
        data: results.data
      });
    }

    // Regular ADMIN must have brandId and role must belong to their brand
    if (!brandId) {
      console.log('Brand ID missing for regular ADMIN');
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }

    // Check if the role belongs to the logged-in user's brand
    const role = await BrandRoles.getById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.brandId !== brandId) {
      return res.status(403).json({ error: 'You do not have permission to view permissions for this role' });
    }

    const results = await BrandPermissions.getByRole(roleId);
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBrandPermissionById = async (req, res) => {
  try {
    const permission = await BrandPermissions.getById(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Brand permission not found' });
    }
    res.status(200).json({
      status: 'success',
      data: permission
    });
  } catch (err) {
    console.error('Error fetching brand permission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createBrandPermission = async (req, res) => {
  try {
    const result = await BrandPermissions.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Brand permission created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating brand permission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBrandPermission = async (req, res) => {
  try {
    const results = await BrandPermissions.update(req.params.id, req.body);
    if (results && results.affectedRows > 0) {
      res.status(200).json({ status: 'success', message: 'Brand permission updated successfully' });
    } else {
      res.status(404).json({ error: 'Brand permission not found' });
    }
  } catch (err) {
    console.error('Error updating brand permission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBrandPermission = async (req, res) => {
  try {
    await BrandPermissions.delete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Brand permission deleted successfully' });
  } catch (err) {
    console.error('Error deleting brand permission:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkUpdatePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;
    if (!roleId || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    const result = await BrandPermissions.bulkUpsert(roleId, permissions);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error bulk updating permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkUpdatePermissionsByAuth = async (req, res) => {
  try {
    const brandId = req.userDetails.brandId;
    const { roleId, permissions } = req.body;
    const userType = req.userDetails.userType;
    const type = req.userDetails.type;

    console.log('bulkUpdatePermissionsByAuth - userDetails:', {
      brandId,
      roleId,
      userType,
      type
    });

    // SUPER ADMIN can update any role's permissions without brandId check
    if (userType === 'Super Admin' || type === 'Super Administrator User') {
      console.log('SUPER ADMIN access granted for bulk update');
      if (!roleId || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }
      const result = await BrandPermissions.bulkUpsert(roleId, permissions);
      return res.status(200).json(result);
    }

    // Regular ADMIN must have brandId and role must belong to their brand
    if (!brandId) {
      console.log('Brand ID missing for regular ADMIN');
      return res.status(400).json({ error: 'Brand ID not found in user details' });
    }

    if (!roleId || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Check if the role belongs to the logged-in user's brand
    const role = await BrandRoles.getById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.brandId !== brandId) {
      return res.status(403).json({ error: 'You do not have permission to update permissions for this role' });
    }

    const result = await BrandPermissions.bulkUpsert(roleId, permissions);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error bulk updating permissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
