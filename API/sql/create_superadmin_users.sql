-- Super Admin Users Table (separate from users table)
CREATE TABLE superadmin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    isActive TINYINT(1) DEFAULT 1,
    token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default Super Admin user (password: admin123)
INSERT INTO superadmin_users (name, email, password, mobile, isActive) 
VALUES ('Super Admin', 'superadmin@printing-task.com', 'admin123', '9876543210', 1);
