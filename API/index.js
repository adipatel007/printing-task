require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fileuploadRoutes = require("./routes/fileuploadRoutes");

const usersRoutes = require('./routes/usersRoutes');
const superadminUsersRoutes = require('./routes/superadminUsersRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const permissionsRoutes = require('./routes/permissionsRoutes');
const pagesRoutes = require('./routes/pagesRoutes');
const pagescategoryRoutes = require('./routes/pagescategoryRoutes');
const siteconfigRoutes = require('./routes/siteconfigRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const brandsRoutes = require('./routes/brandsRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const brandUsersRoutes = require('./routes/brandUsersRoutes');
const pageCategoriesRoutes = require('./routes/pageCategoriesRoutes');
const cmsPagesRoutes = require('./routes/cmsPagesRoutes');
const brandRolesRoutes = require('./routes/brandRolesRoutes');
const brandPermissionsRoutes = require('./routes/brandPermissionsRoutes');
const brandConfigRoutes = require('./routes/brandConfigRoutes');
const customersRoutes = require('./routes/customersRoutes');
const customerAddressesRoutes = require('./routes/customerAddressesRoutes');
const vendorsRoutes = require('./routes/vendorsRoutes');
const productsRoutes = require('./routes/productsRoutes');
const contactLeadsRoutes = require('./routes/contactLeadsRoutes');
const productCategoriesRoutes = require('./routes/productCategoriesRoutes');
const productTypesRoutes = require('./routes/productTypesRoutes');
const bannersRoutes = require('./routes/bannersRoutes');
const aboutUsRoutes = require('./routes/aboutUsRoutes');
const hordingCategoriesRoutes = require('./routes/hordingCategoriesRoutes');
const hoardingsRoutes = require('./routes/hoardingsRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const paymentSettingsRoutes = require('./routes/paymentSettingsRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');
const initializeDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use("/api/file", fileuploadRoutes);

app.use('/api/superadmin', superadminUsersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/pagescategory', pagescategoryRoutes);
app.use('/api/siteconfig', siteconfigRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/brand-users', brandUsersRoutes);
app.use('/api/cms/page-categories', pageCategoriesRoutes);
app.use('/api/cms/pages', cmsPagesRoutes);
app.use('/api/brand-roles', brandRolesRoutes);
app.use('/api/brand-permissions', brandPermissionsRoutes);
app.use('/api/brand-config', brandConfigRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/customer-addresses', customerAddressesRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/contact-leads', contactLeadsRoutes);
app.use('/api/product-categories', productCategoriesRoutes);
app.use('/api/product-types', productTypesRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/about-us', aboutUsRoutes);
app.use('/api/hording-categories', hordingCategoriesRoutes);
app.use('/api/hoardings', hoardingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export app for Vercel serverless
module.exports = app;

// Start server only if not in Vercel environment
if (require.main === module) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}