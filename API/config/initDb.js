const db = require('./db');

async function initializeDatabase() {
    try {
        console.log('Checking and creating tables...');

        // Create superadmin_users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS superadmin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                mobile VARCHAR(20),
                isActive TINYINT(1) DEFAULT 1,
                token TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('superadmin_users table ready');

        // Create brands table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS brands (
                id INT AUTO_INCREMENT PRIMARY KEY,
                brandName VARCHAR(255) NOT NULL,
                brandCode VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(255),
                mobile VARCHAR(20),
                primaryColor VARCHAR(7) DEFAULT '#000000',
                whiteLogo TEXT,
                blackLogo TEXT,
                domain VARCHAR(255),
                settingsJson TEXT,
                isActive TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('brands table ready');

        // Check if settingsJson column exists in brands table
        const [brandsTableColumns] = await db.execute(`SHOW COLUMNS FROM brands`);
        const brandsColumnNames = brandsTableColumns.map(col => col.Field);

        if (!brandsColumnNames.includes('settingsJson')) {
            await db.execute(`ALTER TABLE brands ADD COLUMN settingsJson TEXT AFTER domain`);
            console.log('Added settingsJson column to brands table');
        }

        // Create payment_settings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payment_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                isRazorpayEnabled TINYINT(1) DEFAULT 0,
                razorpayKeyId VARCHAR(255),
                razorpayKeySecret VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('payment_settings table ready');

        // Insert default payment settings if not exists
        const [paymentSettings] = await db.execute(`SELECT COUNT(*) as count FROM payment_settings`);
        if (paymentSettings[0].count === 0) {
            await db.execute(`
                INSERT INTO payment_settings (isRazorpayEnabled, razorpayKeyId, razorpayKeySecret)
                VALUES (0, '', '')
            `);
            console.log('Default payment settings inserted');
        }

        // Check if address and currency columns exist in brand_config table
        const [brandConfigTableColumns] = await db.execute(`SHOW COLUMNS FROM brand_config`);
        const brandConfigColumnNames = brandConfigTableColumns.map(col => col.Field);

        if (!brandConfigColumnNames.includes('address')) {
            await db.execute(`ALTER TABLE brand_config ADD COLUMN address TEXT AFTER domain`);
            console.log('Added address column to brand_config table');
        }

        if (!brandConfigColumnNames.includes('currency_symbol')) {
            await db.execute(`ALTER TABLE brand_config ADD COLUMN currency_symbol VARCHAR(10) NULL AFTER address`);
            console.log('Added currency_symbol column to brand_config table');
        }

        if (!brandConfigColumnNames.includes('currency')) {
            await db.execute(`ALTER TABLE brand_config ADD COLUMN currency VARCHAR(10) NULL AFTER currency_symbol`);
            console.log('Added currency column to brand_config table');
        }

        // Check and add columns to users table for multi-tenancy
        const [usersTableColumns] = await db.execute(`SHOW COLUMNS FROM users`);
        const columnNames = usersTableColumns.map(col => col.Field);

        // First, add roleId column (for role-based access in ADMIN panel)
        if (!columnNames.includes('roleId')) {
            await db.execute(`ALTER TABLE users ADD COLUMN roleId INT NULL AFTER id`);
            console.log('Added roleId column to users table');
        }

        // Then, add userType column
        if (!columnNames.includes('userType')) {
            await db.execute(`ALTER TABLE users ADD COLUMN userType ENUM('SUPER_ADMIN','BRAND_USER') DEFAULT 'BRAND_USER' AFTER roleId`);
            console.log('Added userType column to users table');
        }

        // Finally, add brandId column
        if (!columnNames.includes('brandId')) {
            await db.execute(`ALTER TABLE users ADD COLUMN brandId INT NULL AFTER userType`);
            console.log('Added brandId column to users table');
        }

        // Create page_categories table for CMS
        await db.execute(`
            CREATE TABLE IF NOT EXISTS page_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                displayOrder INT DEFAULT 0,
                isActive TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('page_categories table ready');

        // Check if isActive column exists in pages table
        const [pagesTableColumns] = await db.execute(`SHOW COLUMNS FROM pages`);
        const pagesColumnNames = pagesTableColumns.map(col => col.Field);

        if (!pagesColumnNames.includes('isActive')) {
            await db.execute(`ALTER TABLE pages ADD COLUMN isActive TINYINT(1) DEFAULT 1 AFTER icon`);
            console.log('Added isActive column to pages table');
        }

        // Create brand_roles table for brand-specific roles
        await db.execute(`
            CREATE TABLE IF NOT EXISTS brand_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                brandId INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                isActive TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE CASCADE
            )
        `);
        console.log('brand_roles table ready');

        // Create brand_permissions table for role-based permissions
        await db.execute(`
            CREATE TABLE IF NOT EXISTS brand_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roleId INT NOT NULL,
                pageId INT NOT NULL,
                canView TINYINT(1) DEFAULT 0,
                canAdd TINYINT(1) DEFAULT 0,
                canEdit TINYINT(1) DEFAULT 0,
                canDelete TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (roleId) REFERENCES brand_roles(id) ON DELETE CASCADE,
                FOREIGN KEY (pageId) REFERENCES pages(pageId) ON DELETE CASCADE,
                UNIQUE KEY unique_role_page (roleId, pageId)
            )
        `);
        console.log('brand_permissions table ready');

        // Create unified permissions table for both ADMIN and SUPER ADMIN
        // Check if table exists and has correct schema
        try {
            await db.execute('SELECT id FROM permissions LIMIT 1');
            console.log('permissions table exists with correct schema');
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                console.log('permissions table missing id column, recreating...');
                await db.execute('DROP TABLE IF EXISTS permissions');
            }
            await db.execute(`
                CREATE TABLE IF NOT EXISTS permissions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    roleId INT NOT NULL,
                    pageId INT NOT NULL,
                    canView TINYINT(1) DEFAULT 0,
                    canAdd TINYINT(1) DEFAULT 0,
                    canEdit TINYINT(1) DEFAULT 0,
                    canDelete TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_role_page (roleId, pageId)
                )
            `);
            console.log('permissions table ready');
        }

        // Create product_images table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS product_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                image VARCHAR(500) NOT NULL,
                sortOrder INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('product_images table ready');

        // Create contact_leads table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS contact_leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('new', 'contacted', 'in-progress', 'closed') DEFAULT 'new',
                brandCode VARCHAR(50) DEFAULT 'default',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_brandCode (brandCode),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('contact_leads table ready');

        // Create product_categories table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS product_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(500),
                isActive TINYINT(1) DEFAULT 1,
                sortOrder INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_isActive (isActive)
            )
        `);
        console.log('product_categories table ready');

        // Create product_types table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS product_types (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                categoryId INT NOT NULL,
                image VARCHAR(500),
                isActive TINYINT(1) DEFAULT 1,
                sortOrder INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (categoryId) REFERENCES product_categories(id) ON DELETE CASCADE,
                INDEX idx_categoryId (categoryId),
                INDEX idx_isActive (isActive)
            )
        `);
        console.log('product_types table ready');

        // Create products table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                categoryId INT NOT NULL,
                typeId INT NOT NULL,
                image VARCHAR(500),
                gallery TEXT,
                discountedPrice DECIMAL(10,2) DEFAULT 0,
                pack INT NOT NULL DEFAULT 1,
                variations TEXT,
                isFeatured TINYINT(1) DEFAULT 0,
                isActive TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (categoryId) REFERENCES product_categories(id) ON DELETE CASCADE,
                FOREIGN KEY (typeId) REFERENCES product_types(id) ON DELETE CASCADE,
                INDEX idx_categoryId (categoryId),
                INDEX idx_typeId (typeId),
                INDEX idx_isActive (isActive),
                INDEX idx_isFeatured (isFeatured)
            )
        `);
        console.log('products table ready');

        // Create banners table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(500) NOT NULL,
                redirectURL VARCHAR(500),
                isActive TINYINT(1) DEFAULT 1,
                sortOrder INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_isActive (isActive),
                INDEX idx_sortOrder (sortOrder)
            )
        `);
        console.log('banners table ready');

        // Create about_us table for CMS
        await db.execute(`
            CREATE TABLE IF NOT EXISTS about_us (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sectionType ENUM('company', 'vision', 'mission', 'core_values', 'other') NOT NULL,
                title VARCHAR(255),
                description TEXT,
                image VARCHAR(500),
                sortOrder INT DEFAULT 0,
                isActive TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_sectionType (sectionType),
                INDEX idx_sortOrder (sortOrder),
                INDEX idx_isActive (isActive)
            )
        `);
        console.log('about_us table ready');

        // Create hording_categories table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS hording_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name)
            )
        `);
        console.log('hording_categories table ready');

        // Create hoardings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS hoardings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                thumbnail VARCHAR(500),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                code VARCHAR(100) NOT NULL UNIQUE,
                price DECIMAL(10,2),
                state VARCHAR(255),
                city VARCHAR(255),
                location VARCHAR(500),
                size VARCHAR(100),
                facing VARCHAR(100),
                type VARCHAR(100),
                visibility VARCHAR(100),
                dailyfootfall INT,
                nearby VARCHAR(500),
                company VARCHAR(255),
                benefits TEXT,
                services TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_code (code),
                INDEX idx_state (state),
                INDEX idx_city (city)
            )
        `);
        console.log('hoardings table ready');

        // Create bookings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hoardingId INT NOT NULL,
                customerId INT NULL,
                name VARCHAR(255) NOT NULL,
                company VARCHAR(255) NULL,
                address TEXT NULL,
                city VARCHAR(255) NULL,
                state VARCHAR(255) NULL,
                country VARCHAR(255) NULL,
                pincode VARCHAR(20) NULL,
                phone VARCHAR(30) NULL,
                email VARCHAR(255) NULL,
                notes TEXT NULL,
                totalDays INT NOT NULL DEFAULT 0,
                amount DECIMAL(12,2) NOT NULL DEFAULT 0,
                paymentStatus ENUM('Pending','Paid','Cancelled') DEFAULT 'Pending',
                startDate DATE NOT NULL,
                endDate DATE NOT NULL,
                razorpayOrderId VARCHAR(255) NULL,
                razorpayPaymentId VARCHAR(255) NULL,
                razorpaySignature VARCHAR(255) NULL,
                razorpayInvoiceUrl TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_hoardingId (hoardingId),
                INDEX idx_customerId (customerId),
                INDEX idx_paymentStatus (paymentStatus),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('bookings table ready');

        // Create customer_addresses table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS customer_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                label VARCHAR(100) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                country VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                city VARCHAR(100) NOT NULL,
                address_line1 TEXT NOT NULL,
                address_line2 TEXT,
                zip_code VARCHAR(20) NOT NULL,
                is_default TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                INDEX idx_customer_id (customer_id),
                INDEX idx_is_default (is_default)
            )
        `);
        console.log('customer_addresses table ready');

        // Check if Razorpay columns exist in bookings table
        const [bookingsTableColumns] = await db.execute(`SHOW COLUMNS FROM bookings`);
        const bookingsColumnNames = bookingsTableColumns.map(col => col.Field);

        if (!bookingsColumnNames.includes('razorpayOrderId')) {
            await db.execute(`ALTER TABLE bookings ADD COLUMN razorpayOrderId VARCHAR(255) NULL AFTER endDate`);
            console.log('Added razorpayOrderId column to bookings table');
        }
        if (!bookingsColumnNames.includes('razorpayPaymentId')) {
            await db.execute(`ALTER TABLE bookings ADD COLUMN razorpayPaymentId VARCHAR(255) NULL AFTER razorpayOrderId`);
            console.log('Added razorpayPaymentId column to bookings table');
        }
        if (!bookingsColumnNames.includes('razorpaySignature')) {
            await db.execute(`ALTER TABLE bookings ADD COLUMN razorpaySignature VARCHAR(255) NULL AFTER razorpayPaymentId`);
            console.log('Added razorpaySignature column to bookings table');
        }
        if (!bookingsColumnNames.includes('razorpayInvoiceUrl')) {
            await db.execute(`ALTER TABLE bookings ADD COLUMN razorpayInvoiceUrl TEXT NULL AFTER razorpaySignature`);
            console.log('Added razorpayInvoiceUrl column to bookings table');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = initializeDatabase;
