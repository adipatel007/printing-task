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

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = initializeDatabase;
