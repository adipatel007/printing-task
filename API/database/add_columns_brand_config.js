const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'srv2108.hstgr.io',
  user: 'u235027237_print',
  port: 3306,
  password: 'Aidges@1011',
  database: 'u235027237_print'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  const alterTableSQL = `
    ALTER TABLE brand_config
    ADD COLUMN whiteLogo VARCHAR(255) AFTER logo,
    ADD COLUMN blackLogo VARCHAR(255) AFTER whiteLogo
  `;

  connection.query(alterTableSQL, (err, result) => {
    if (err) {
      console.error('Error adding columns to brand_config table:', err);
      connection.end();
      process.exit(1);
    }
    console.log('whiteLogo and blackLogo columns added successfully to brand_config table');
    connection.end();
    process.exit(0);
  });
});
