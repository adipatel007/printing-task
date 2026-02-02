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

        // Check if address column exists in brand_config table
        const [brandConfigTableColumns] = await db.execute(`SHOW COLUMNS FROM brand_config`);
        const brandConfigColumnNames = brandConfigTableColumns.map(col => col.Field);

        if (!brandConfigColumnNames.includes('address')) {
            await db.execute(`ALTER TABLE brand_config ADD COLUMN address TEXT AFTER domain`);
            console.log('Added address column to brand_config table');
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

        // Check if default superadmin user exists
        const [existingUsers] = await db.execute(`SELECT id FROM superadmin_users WHERE email = ?`, ['superadmin@printing-task.com']);
        if (existingUsers.length === 0) {
            await db.execute(`
                INSERT INTO superadmin_users (name, email, password, mobile, isActive)
                VALUES ('Super Admin', 'superadmin@printing-task.com', 'admin123', '9876543210', 1)
            `);
            console.log('Default Super Admin user created: superadmin@printing-task.com / admin123');
        } else {
            console.log('Default Super Admin user already exists');
        }

        // Fix page category ID mapping
        console.log('Checking page category ID mapping...');
        try {
            // Get Overview category
            const [overviewCat] = await db.execute(`SELECT id FROM pagescategory WHERE name = 'Overview' LIMIT 1`);
            // Get Administrator category
            const [adminCat] = await db.execute(`SELECT id FROM pagescategory WHERE name = 'Administrator' LIMIT 1`);

            if (overviewCat.length > 0) {
                const overviewId = overviewCat[0].id;
                await db.execute(`UPDATE pages SET categoryId = ? WHERE categoryId = 1`, [overviewId]);
                console.log(`Updated pages with categoryId 1 to ${overviewId} (Overview)`);
            }

            if (adminCat.length > 0) {
                const adminId = adminCat[0].id;
                await db.execute(`UPDATE pages SET categoryId = ? WHERE categoryId = 2`, [adminId]);
                console.log(`Updated pages with categoryId 2 to ${adminId} (Administrator)`);
            }
        } catch (err) {
            console.error('Error fixing page category mapping:', err);
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = initializeDatabase;
