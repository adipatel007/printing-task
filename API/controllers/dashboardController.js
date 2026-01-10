const Dashboard = require('../models/dashboardModel');

exports.adminDashboard = async (req, res) => {
  try {
    console.log('Fetching Dashboard data');
    const results = await Dashboard.adminDashboard();
    console.log('Dashboard result:', results);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching Dashboard:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};