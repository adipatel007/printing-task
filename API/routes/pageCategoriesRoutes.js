const express = require('express');
const router = express.Router();
const pageCategoriesController = require('../controllers/pageCategoriesController');
const { auth } = require('../middlewares/auth');
const { superAdminOnly } = require('../middlewares/superAdminOnly');

router.get('/', auth, superAdminOnly, pageCategoriesController.getAllPageCategories);
router.get('/:id', auth, superAdminOnly, pageCategoriesController.getPageCategoryById);
router.post('/', auth, superAdminOnly, pageCategoriesController.createPageCategory);
router.put('/:id', auth, superAdminOnly, pageCategoriesController.updatePageCategory);
router.delete('/:id', auth, superAdminOnly, pageCategoriesController.deletePageCategory);

module.exports = router;
