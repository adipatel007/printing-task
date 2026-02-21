const db = require('../config/db');

const Dashboard = {
  /**
   * Super Admin dashboard (no brandId, userType === 'SUPER_ADMIN'):
   *  - superAdminCount
   *  - brandCount
   *  - activeBrandCount
   *  - recentBrandCount (this month)
   *  - brandCreationTimeline / brandCreationMonths
   *  - recentBrands
   *
   * Brand Admin / other users (brandId present):
   *  - existing users / roles based metrics
   */
  adminDashboard: async (brandId, userType) => {
    try {
      // SUPER ADMIN DASHBOARD (no brandId, userType SUPER_ADMIN)
      if (!brandId && userType === 'SUPER_ADMIN') {
        // Total active super admins
        const [superAdmins] = await db.execute(`
          SELECT COUNT(*) AS count
          FROM superadmin_users
          WHERE isActive = 1
        `);

        // Total brands
        const [totalBrands] = await db.execute(`
          SELECT COUNT(*) AS count
          FROM brands
        `);

        // Active brands
        const [activeBrands] = await db.execute(`
          SELECT COUNT(*) AS count
          FROM brands
          WHERE isActive = 1
        `);

        // Brands created in current month
        const [recentBrandCount] = await db.execute(`
          SELECT COUNT(*) AS count
          FROM brands
          WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        // Brand creation timeline (last 6 months)
        const [brandTimeline] = await db.execute(`
          SELECT
            DATE_FORMAT(created_at, '%b %Y') AS month,
            COUNT(*) AS count
          FROM brands
          WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%b %Y')
          ORDER BY created_at ASC
        `);

        const brandCreationMonths = brandTimeline.map(row => row.month);
        const brandCreationTimeline = brandTimeline.map(row => row.count);

        // Recent brands (last 5)
        const [recentBrands] = await db.execute(`
          SELECT id, brandName, created_at, isActive
          FROM brands
          ORDER BY created_at DESC
          LIMIT 5
        `);

        const dashboardJson = [
          {
            superAdminCount: superAdmins[0]?.count || 0,
            brandCount: totalBrands[0]?.count || 0,
            activeBrandCount: activeBrands[0]?.count || 0,
            recentBrandCount: recentBrandCount[0]?.count || 0,
            brandCreationTimeline,
            brandCreationMonths,
            recentBrands,
          },
        ];

        return {
          status: 'success',
          data: dashboardJson,
        };
      }

      // BRAND / ADMIN DASHBOARD (brand-scoped users & roles) - existing logic
      const brandFilter = brandId ? `WHERE brandId = ?` : '';
      const params = brandId ? [brandId] : [];

      // Get total users (all users for this brand)
      const [totalUsers] = await db.execute(`
        SELECT COUNT(*) AS count
        FROM users
        ${brandFilter}
      `, params);

      // Get active users
      const [activeUsers] = await db.execute(`
        SELECT COUNT(*) AS count
        FROM users
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 1
      `, params);

      // Get inactive users
      const [inactiveUsers] = await db.execute(`
        SELECT COUNT(*) AS count
        FROM users
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 0
      `, params);

      // Get users created this month
      const [recentUsersCount] = await db.execute(`
        SELECT COUNT(*) AS count
        FROM users
        ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'}
        MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `, params);

      // Get total roles (roles table for super admin, brand_roles for brand admin)
      const rolesTable = brandId ? 'brand_roles' : 'roles';
      const [totalRoles] = await db.execute(`
        SELECT COUNT(*) AS count
        FROM ${rolesTable}
        ${brandFilter}
      `, params);

      // Get active roles (only for brand_roles, roles table doesn't have isActive)
      let activeRolesCount = 0;
      if (brandId) {
        const [activeRoles] = await db.execute(`
          SELECT COUNT(*) AS count
          FROM ${rolesTable}
          ${brandFilter} ${brandFilter ? 'AND' : 'WHERE'} isActive = 1
        `, params);
        activeRolesCount = activeRoles[0].count;
      } else {
        // For non-branded context, treat all roles as active
        activeRolesCount = totalRoles[0].count;
      }

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

      // Get recent users (last 5)
      const [recentUsers] = await db.execute(`
        SELECT id, name, email, roleId, isActive, created_at
        FROM users
        ${brandFilter}
        ORDER BY created_at DESC
        LIMIT 5
      `, params);

      const dashboardJson = [
        {
          totalUsers: totalUsers[0].count,
          activeUsers: activeUsers[0].count,
          inactiveUsers: inactiveUsers[0].count,
          recentUsersCount: recentUsersCount[0].count,
          totalRoles: totalRoles[0].count,
          activeRoles: activeRolesCount,
          userCreationTimeline,
          userCreationMonths,
          recentUsers,
        },
      ];

      const dataJSON = {
        status: 'success',
        data: dashboardJson,
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