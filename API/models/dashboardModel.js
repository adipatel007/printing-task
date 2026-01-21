const db = require('../config/db');

const Dashboard = {
  adminDashboard: async (brandId) => {
    try {
      const brandFilter = brandId ? `WHERE brandId = ?` : '';
      const params = brandId ? [brandId] : [];

      // Get total users for this brand
      const [totalUsers] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM users 
        ${brandFilter}
      `, params);

      // Get active users for this brand
      const [activeUsers] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM users 
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 1
      `, params);

      // Get inactive users for this brand
      const [inactiveUsers] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM users 
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 0
      `, params);

      // Get users created this month for this brand
      const [recentUsersCount] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM users 
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'}
        MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `, params);

      // Get total roles for this brand
      const [totalRoles] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM brand_roles 
        ${brandFilter}
      `, params);

      // Get active roles for this brand
      const [activeRoles] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM brand_roles 
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 1
      `, params);

      const [userTimeline] = await db.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%b %Y') AS month,
          COUNT(*) AS count
        FROM users
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'}
        created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%b %Y')
        ORDER BY created_at ASC
      `, params);

      const userCreationMonths = userTimeline.map(row => row.month);
      const userCreationTimeline = userTimeline.map(row => row.count);

      // Get recent users for this brand (last 5)
      const [recentUsers] = await db.execute(`
        SELECT id, name, email, roleId, isActive, created_at
        FROM users
        ${brandFilter}
        ORDER BY created_at DESC
        LIMIT 5
      `, params);

      let dashboardJson = [
        {
          totalUsers: totalUsers[0].count,
          activeUsers: activeUsers[0].count,
          inactiveUsers: inactiveUsers[0].count,
          recentUsersCount: recentUsersCount[0].count,
          totalRoles: totalRoles[0].count,
          activeRoles: activeRoles[0].count,
          userCreationTimeline: userCreationTimeline,
          userCreationMonths: userCreationMonths,
          recentUsers: recentUsers
        }
      ];

      let dataJSON = {
        status: 'success',
        data: dashboardJson
      };
      console.log('Dashboard data:', dataJSON);
      return dataJSON;
    } catch (err) {
      console.error('Dashboard model error:', err);
      throw err;
    }
  },
};

module.exports = Dashboard;