-- Product Categories Table
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(255),
  `sortOrder` INT DEFAULT 0,
  `isActive` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `categoryId` INT,
  `basePrice` DECIMAL(10, 2) NOT NULL,
  `moq` INT DEFAULT 1,
  `deliveryDays` INT DEFAULT 7,
  `allowDesignUpload` TINYINT DEFAULT 1,
  `allowOnlineDesign` TINYINT DEFAULT 0,
  `maxUploadSizeMB` INT DEFAULT 10,
  `supportedFormats` JSON,
  `createdBy` INT,
  `isActive` TINYINT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoryId`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `sortOrder` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Product Sizes Table
CREATE TABLE IF NOT EXISTS `product_sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `width` DECIMAL(10, 2),
  `height` DECIMAL(10, 2),
  `unit` VARCHAR(10) DEFAULT 'mm',
  `priceAdjustment` DECIMAL(10, 2) DEFAULT 0,
  `sortOrder` INT DEFAULT 0,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Product Materials Table
CREATE TABLE IF NOT EXISTS `product_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `gsm` INT,
  `priceAdjustment` DECIMAL(10, 2) DEFAULT 0,
  `sortOrder` INT DEFAULT 0,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Product Paper Types Table
CREATE TABLE IF NOT EXISTS `product_paper_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `priceAdjustment` DECIMAL(10, 2) DEFAULT 0,
  `sortOrder` INT DEFAULT 0,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Product Pricing Rules Table
CREATE TABLE IF NOT EXISTS `product_pricing_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `minQuantity` INT NOT NULL,
  `maxQuantity` INT,
  `pricePerUnit` DECIMAL(10, 2) NOT NULL,
  `discountPercent` DECIMAL(5, 2) DEFAULT 0,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Cart Table
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `productId` INT NOT NULL,
  `sizeId` INT,
  `materialId` INT,
  `paperTypeId` INT,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `designFile` VARCHAR(500),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `orderNumber` VARCHAR(50) UNIQUE NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `taxAmount` DECIMAL(10, 2) DEFAULT 0,
  `discountAmount` DECIMAL(10, 2) DEFAULT 0,
  `finalAmount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'in_production', 'qc', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending',
  `paymentStatus` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `paymentMethod` VARCHAR(50),
  `shippingAddress` TEXT,
  `notes` TEXT,
  `createdBy` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `productName` VARCHAR(255) NOT NULL,
  `sizeId` INT,
  `sizeName` VARCHAR(100),
  `materialId` INT,
  `materialName` VARCHAR(100),
  `paperTypeId` INT,
  `paperTypeName` VARCHAR(100),
  `quantity` INT NOT NULL,
  `pricePerUnit` DECIMAL(10, 2) NOT NULL,
  `totalPrice` DECIMAL(10, 2) NOT NULL,
  `designFile` VARCHAR(500),
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO `product_categories` (`name`, `description`, `sortOrder`) VALUES
('Business Cards', 'Professional business cards printing', 1),
('Flyers', 'Marketing flyers and brochures', 2),
('Posters', 'Large format posters and banners', 3),
('Stickers', 'Custom stickers and labels', 4),
('Books', 'Books and booklets printing', 5),
('Packaging', 'Custom packaging solutions', 6);
