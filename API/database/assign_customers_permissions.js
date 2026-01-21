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

    const pageId = 128; // Customers page ID

    // Get all roles
    connection.query('SELECT id FROM brand_roles', (err, roles) => {
        if (err) {
            console.error('Error fetching roles:', err);
            connection.end();
            process.exit(1);
        }

        console.log('Roles found:', roles.length);

        // Assign full permissions (canView, canAdd, canEdit, canDelete) to all roles
        const insertPermissionsSQL = `
            INSERT INTO permissions (roleId, pageId, canView, canAdd, canEdit, canDelete, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        let completed = 0;
        roles.forEach(role => {
            connection.query(insertPermissionsSQL, [role.id, pageId, 1, 1, 1, 1], (err, result) => {
                if (err) {
                    console.error('Error adding permission for role:', role.id, err);
                } else {
                    console.log('Permission added for role:', role.id);
                }
                completed++;
                if (completed === roles.length) {
                    console.log('Customers permissions assigned successfully to all roles');
                    connection.end();
                    process.exit(0);
                }
            });
        });
    });
});
