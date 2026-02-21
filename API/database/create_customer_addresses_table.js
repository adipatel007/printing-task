const db = require('../config/db');

const createCustomerAddressesTable = async () => {
    try {
        const createTableSQL = `
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
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
            )
        `;

        await db.execute(createTableSQL);
        console.log('customer_addresses table created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating customer_addresses table:', err);
        process.exit(1);
    }
};

createCustomerAddressesTable();
