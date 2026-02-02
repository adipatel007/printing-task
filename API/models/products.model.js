class Product {
  constructor() {
    this.id = undefined;
    this.name = '';
    this.description = '';
    this.categoryId = 0;
    this.categoryName = '';
    this.images = [];
    this.thumbnail = '';
    this.isActive = 1;
    this.createdBy = undefined;
    this.created_at = '';
    this.updated_at = '';
  }
}

class ProductDetail {
  constructor() {
    this.sizes = [];
    this.materials = [];
    this.paperTypes = [];
    this.pricingRules = [];
    this.basePrice = 0;
    this.moq = 1;
    this.deliveryDays = 7;
    this.allowDesignUpload = true;
    this.allowOnlineDesign = false;
    this.maxUploadSizeMB = 10;
    this.supportedFormats = ['jpg', 'png', 'pdf', 'ai', 'cdr', 'psd'];
  }
}

class ProductSize {
  constructor() {
    this.id = undefined;
    this.productId = 0;
    this.name = '';
    this.width = 0;
    this.height = 0;
    this.unit = 'mm';
    this.priceAdjustment = 0;
    this.sortOrder = 0;
  }
}

class ProductMaterial {
  constructor() {
    this.id = undefined;
    this.productId = 0;
    this.name = '';
    this.gsm = 0;
    this.priceAdjustment = 0;
    this.sortOrder = 0;
  }
}

class ProductPaperType {
  constructor() {
    this.id = undefined;
    this.productId = 0;
    this.name = '';
    this.priceAdjustment = 0;
    this.sortOrder = 0;
  }
}

class PricingRule {
  constructor() {
    this.id = undefined;
    this.productId = 0;
    this.minQuantity = 1;
    this.maxQuantity = undefined;
    this.pricePerUnit = 0;
    this.discountPercent = 0;
  }
}

class ProductCategory {
  constructor() {
    this.id = undefined;
    this.name = '';
    this.description = '';
    this.icon = '';
    this.sortOrder = 0;
    this.isActive = 1;
    this.created_at = '';
    this.updated_at = '';
  }
}

class ProductFilter {
  constructor() {
    this.categoryId = undefined;
    this.sizeId = undefined;
    this.materialId = undefined;
    this.paperTypeId = undefined;
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.search = '';
  }
}

module.exports = {
  Product,
  ProductDetail,
  ProductSize,
  ProductMaterial,
  ProductPaperType,
  PricingRule,
  ProductCategory,
  ProductFilter
};
