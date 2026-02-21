const PageCategories = require('../models/pageCategoriesModel');

exports.getAllPageCategories = async (req, res) => {
  try {
    const results = await PageCategories.getAll();
    res.status(200).json({
      status: 'success',
      data: results.data
    });
  } catch (err) {
    console.error('Error fetching page categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPageCategoryById = async (req, res) => {
  try {
    const category = await PageCategories.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Page category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (err) {
    console.error('Error fetching page category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPageCategory = async (req, res) => {
  try {
    const result = await PageCategories.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Page category created successfully',
      data: result.data
    });
  } catch (err) {
    console.error('Error creating page category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePageCategory = async (req, res) => {
  try {
    const results = await PageCategories.update(req.params.id, req.body);
    if (results && results.affectedRows > 0) {
      res.status(200).json({ status: 'success', message: 'Page category updated successfully' });
    } else {
      res.status(404).json({ error: 'Page category not found' });
    }
  } catch (err) {
    console.error('Error updating page category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePageCategory = async (req, res) => {
  try {
    await PageCategories.delete(req.params.id);
    res.status(200).json({ status: 'success', message: 'Page category deleted successfully' });
  } catch (err) {
    console.error('Error deleting page category:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
