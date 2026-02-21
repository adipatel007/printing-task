const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'srv2108.hstgr.io',
    user: 'u235027237_print',
    password: 'Aidges@1011',
    database: 'u235027237_print',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');

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

    connection.query(createTableSQL, (err, result) => {
        if (err) {
            console.error('Error creating customers table:', err);
            connection.end();
            process.exit(1);
        }
        console.log('customers table created successfully');
        connection.end();
        process.exit(0);
    });
});