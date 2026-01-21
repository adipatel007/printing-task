const db = require('../config/db');

const createCustomersTable = async () => {
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                mobile VARCHAR(20),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                zipCode VARCHAR(20),
                country VARCHAR(100),
                brandId INT NOT NULL,
                isActive TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE CASCADE
            )
        `;

        await db.execute(createTableSQL);
        console.log('customers table created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating customers table:', err);
        process.exit(1);
    }
};

createCustomersTable();