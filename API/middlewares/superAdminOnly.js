module.exports.superAdminOnly = async (req, res, next) => {
  try {
    if (!req.userDetails || !req.userDetails.userType) {
      return res.status(403).json({ error: 'Forbidden - No user details' });
    }

    if (req.userDetails.userType !== 'SUPER_ADMIN' && req.userDetails.userType !== 'Super Admin') {
      return res.status(403).json({ error: 'Forbidden - Super Admin access only' });
    }

    next();
  } catch (err) {
    console.error('Super Admin Only middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
