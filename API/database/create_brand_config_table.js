const db = require('../config/db');

const createBrandConfigTable = async () => {
  try {
    const sql = `
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
    await db.execute(sql);
    console.log('brand_config table created successfully');
  } catch (err) {
    console.error('Error creating brand_config table:', err);
    throw err;
  }
};

const init = async () => {
  await createBrandConfigTable();
  process.exit(0);
};

init();
