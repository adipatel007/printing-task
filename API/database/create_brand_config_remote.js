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

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS brand_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      brandId INT NOT NULL,
      logo VARCHAR(255),
      primaryColor VARCHAR(50),
      twitterURL VARCHAR(255),
      youtubeURL VARCHAR(255),
      instagramURL VARCHAR(255),
      facebookURL VARCHAR(255),
      mobile VARCHAR(20),
      email VARCHAR(255),
      domain VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE CASCADE
    )
  `;

  connection.query(createTableSQL, (err, result) => {
    if (err) {
      console.error('Error creating brand_config table:', err);
      connection.end();
      process.exit(1);
    }
    console.log('brand_config table created successfully');
    connection.end();
    process.exit(0);
  });
});
