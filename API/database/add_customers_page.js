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

    const insertPageSQL = `
        INSERT INTO pages (pagename, url, icon, isActive, categoryId, displayorder, created_at, updated_at)
        VALUES ('Customers', '/customers', 'users', 1, 2, 5, NOW(), NOW())
    `;

    connection.query(insertPageSQL, (err, result) => {
        if (err) {
            console.error('Error adding Customers page:', err);
            connection.end();
            process.exit(1);
        }
        console.log('Customers page added successfully with ID:', result.insertId);
        connection.end();
        process.exit(0);
    });
});
