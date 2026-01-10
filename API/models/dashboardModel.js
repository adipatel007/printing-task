const db = require('../config/db');

const Dashboard = {
  adminDashboard: async () => {
    try {
      // Get Super Admin count
      const [superAdmins] = await db.execute(`SELECT COUNT(*) AS count FROM superadmin_users WHERE isActive = 1`);
      
      // Get total brands count
      const [totalBrands] = await db.execute(`SELECT COUNT(*) AS count FROM brands`);
      
      // Get active brands count
      const [activeBrands] = await db.execute(`SELECT COUNT(*) AS count FROM brands WHERE isActive = 1`);
      
      // Get inactive brands count
      const [inactiveBrands] = await db.execute(`SELECT COUNT(*) AS count FROM brands WHERE isActive = 0`);
      
      // Get brands created this month
      const [recentBrandsCount] = await db.execute(`
        SELECT COUNT(*) AS count 
        FROM brands 
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `);

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
      
      // Get recent brands (last 5)
      const [recentBrands] = await db.execute(`
        SELECT id, brandName, brandCode, email, blackLogo, isActive, created_at
        FROM brands
        ORDER BY created_at DESC
        LIMIT 5
      `);

      let dashboardJson = [
        {
          superAdminCount: superAdmins[0].count,
          brandCount: totalBrands[0].count,
          activeBrandCount: activeBrands[0].count,
          inactiveBrandCount: inactiveBrands[0].count,
          recentBrandCount: recentBrandsCount[0].count,
          brandCreationTimeline: brandCreationTimeline,
          brandCreationMonths: brandCreationMonths,
          recentBrands: recentBrands
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