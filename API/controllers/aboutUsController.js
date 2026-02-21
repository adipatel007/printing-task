const db = require('../config/db');

async function getAllAboutUs(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM about_us ORDER BY sortOrder ASC, id ASC'
    );
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching about us:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch about us content' });
  }
}

async function getAboutUsById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM about_us WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'About us content not found' });
    }
    
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('Error fetching about us by id:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch about us content' });
  }
}

async function createAboutUs(req, res) {
  try {
    const { sectionType, title, description, image, sortOrder, isActive } = req.body;
    
    if (!sectionType) {
      return res.status(400).json({ status: 'error', message: 'sectionType is required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO about_us (sectionType, title, description, image, sortOrder, isActive) VALUES (?, ?, ?, ?, ?, ?)',
      [sectionType, title || null, description || null, image || null, sortOrder || 0, isActive !== undefined ? isActive : 1]
    );
    
    res.json({ status: 'success', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating about us:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create about us content' });
  }
}

async function updateAboutUs(req, res) {
  try {
    const { id } = req.params;
    const { sectionType, title, description, image, sortOrder, isActive } = req.body;
    
    const [existing] = await db.execute('SELECT * FROM about_us WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'About us content not found' });
    }
    
    await db.execute(
      'UPDATE about_us SET sectionType = ?, title = ?, description = ?, image = ?, sortOrder = ?, isActive = ? WHERE id = ?',
      [
        sectionType || existing[0].sectionType,
        title !== undefined ? title : existing[0].title,
        description !== undefined ? description : existing[0].description,
        image !== undefined ? image : existing[0].image,
        sortOrder !== undefined ? sortOrder : existing[0].sortOrder,
        isActive !== undefined ? isActive : existing[0].isActive,
        id
      ]
    );
    
    res.json({ status: 'success', message: 'About us content updated successfully' });
  } catch (error) {
    console.error('Error updating about us:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update about us content' });
  }
}

async function deleteAboutUs(req, res) {
  try {
    const { id } = req.params;
    
    const [existing] = await db.execute('SELECT * FROM about_us WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'About us content not found' });
    }
    
    await db.execute('DELETE FROM about_us WHERE id = ?', [id]);
    
    res.json({ status: 'success', message: 'About us content deleted successfully' });
  } catch (error) {
    console.error('Error deleting about us:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete about us content' });
  }
}

async function updateAboutUsStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ status: 'error', message: 'isActive is required' });
    }
    
    const [existing] = await db.execute('SELECT * FROM about_us WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'About us content not found' });
    }
    
    await db.execute('UPDATE about_us SET isActive = ? WHERE id = ?', [isActive, id]);
    
    res.json({ status: 'success', message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating about us status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update status' });
  }
}

module.exports = {
  getAllAboutUs,
  getAboutUsById,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
  updateAboutUsStatus
};
