const express = require('express');
const router = express.Router();
const Pages = require('../models/pagesModel');
const PageCategories = require('../models/pageCategoriesModel');
const { auth } = require('../middlewares/auth');
const { superAdminOnly } = require('../middlewares/superAdminOnly');

exports.getAllPages = async (req, res) => {
  try {
    const db = require('../config/db');
    const [results] = await db.execute(`
      SELECT
        pages.*,
        COALESCE(page_categories.name, 'Uncategorized') AS categoryName
      FROM pages
      LEFT JOIN page_categories ON pages.categoryId = page_categories.id
      ORDER BY pages.displayorder ASC, pages.created_at DESC
    `);
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPageById = async (req, res) => {
  try {
    const [results] = await require('../config/db').execute(`
      SELECT 
        pages.*, 
        COALESCE(page_categories.name, 'Uncategorized') AS categoryName
      FROM pages
      LEFT JOIN page_categories ON pages.categoryId = page_categories.id
      WHERE pages.pageId = ?
    `, [req.params.id]);
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(200).json({
      status: 'success',
      data: results[0]
    });
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPage = async (req, res) => {
  try {
    const result = await Pages.create(req.body, req.userDetails);
    res.status(201).json({
      status: 'success',
      message: 'Page created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const results = await Pages.update(req.params.id, req.body, req.userDetails);
    if (results && results.data && results.data.affectedRows > 0) {
      res.status(200).json({ status: 'success', message: 'Page updated successfully' });
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePage = async (req, res) => {
  try {
    await Pages.delete(req.params.id, req.userDetails);
    res.status(200).json({ status: 'success', message: 'Page deleted successfully' });
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', auth, superAdminOnly, exports.getAllPages);
router.get('/:id', auth, superAdminOnly, exports.getPageById);
router.post('/', auth, superAdminOnly, exports.createPage);
router.put('/:id', auth, superAdminOnly, exports.updatePage);
router.delete('/:id', auth, superAdminOnly, exports.deletePage);

module.exports = router;
