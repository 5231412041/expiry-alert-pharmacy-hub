
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const auth = require('../middleware/auth');

// Get all medicines
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, man.name as manufacturer_name
      FROM medicines m
      JOIN manufacturers man ON m.manufacturer_id = man.id
      ORDER BY m.expiry_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medicines by status (expiring-soon, expired, safe)
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    let query = '';
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (status === 'expiring-soon') {
      query = `
        SELECT m.*, man.name as manufacturer_name
        FROM medicines m
        JOIN manufacturers man ON m.manufacturer_id = man.id
        WHERE m.expiry_date > CURRENT_DATE AND m.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY m.expiry_date ASC
      `;
    } else if (status === 'expired') {
      query = `
        SELECT m.*, man.name as manufacturer_name
        FROM medicines m
        JOIN manufacturers man ON m.manufacturer_id = man.id
        WHERE m.expiry_date <= CURRENT_DATE
        ORDER BY m.expiry_date ASC
      `;
    } else if (status === 'safe') {
      query = `
        SELECT m.*, man.name as manufacturer_name
        FROM medicines m
        JOIN manufacturers man ON m.manufacturer_id = man.id
        WHERE m.expiry_date > CURRENT_DATE + INTERVAL '30 days'
        ORDER BY m.expiry_date ASC
      `;
    } else {
      return res.status(400).json({ message: 'Invalid status parameter' });
    }
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get medicines by status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medicine by id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT m.*, man.name as manufacturer_name
      FROM medicines m
      JOIN manufacturers man ON m.manufacturer_id = man.id
      WHERE m.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get medicine by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add medicine
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      batch, 
      quantity, 
      manufacturerId, 
      manufactureDate, 
      expiryDate 
    } = req.body;
    
    // Validate input
    if (!name || !batch || !quantity || !manufacturerId || !expiryDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    const id = uuidv4();
    const addedBy = req.user.id;
    
    const result = await db.query(`
      INSERT INTO medicines 
      (id, name, batch, quantity, manufacturer_id, manufacture_date, expiry_date, added_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, name, batch, quantity, manufacturerId, manufactureDate, expiryDate, addedBy]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      batch, 
      quantity, 
      manufacturerId, 
      manufactureDate, 
      expiryDate 
    } = req.body;
    
    // Validate input
    if (!name || !batch || !quantity || !manufacturerId || !expiryDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Check if medicine exists
    const medicineExists = await db.query('SELECT * FROM medicines WHERE id = $1', [id]);
    if (medicineExists.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const result = await db.query(`
      UPDATE medicines
      SET name = $1, batch = $2, quantity = $3, manufacturer_id = $4, 
          manufacture_date = $5, expiry_date = $6
      WHERE id = $7
      RETURNING *
    `, [name, batch, quantity, manufacturerId, manufactureDate, expiryDate, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if medicine exists
    const medicineExists = await db.query('SELECT * FROM medicines WHERE id = $1', [id]);
    if (medicineExists.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    await db.query('DELETE FROM medicines WHERE id = $1', [id]);
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medicine summary
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = {
      total: 0,
      expiringSoon: 0,
      expired: 0,
      safe: 0
    };
    
    // Get total count
    const totalResult = await db.query('SELECT COUNT(*) FROM medicines');
    summary.total = parseInt(totalResult.rows[0].count);
    
    // Get expiring soon count
    const expiringSoonResult = await db.query(`
      SELECT COUNT(*) FROM medicines
      WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
    `);
    summary.expiringSoon = parseInt(expiringSoonResult.rows[0].count);
    
    // Get expired count
    const expiredResult = await db.query(`
      SELECT COUNT(*) FROM medicines
      WHERE expiry_date <= CURRENT_DATE
    `);
    summary.expired = parseInt(expiredResult.rows[0].count);
    
    // Get safe count
    const safeResult = await db.query(`
      SELECT COUNT(*) FROM medicines
      WHERE expiry_date > CURRENT_DATE + INTERVAL '30 days'
    `);
    summary.safe = parseInt(safeResult.rows[0].count);
    
    res.json(summary);
  } catch (error) {
    console.error('Get medicine summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import medicines from CSV
router.post('/import', auth, async (req, res) => {
  try {
    const { medicines } = req.body;
    
    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({ message: 'Invalid medicines data' });
    }
    
    const addedBy = req.user.id;
    const results = [];
    
    for (const medicine of medicines) {
      const { name, batch, quantity, manufacturerId, manufactureDate, expiryDate } = medicine;
      
      // Validate required fields
      if (!name || !batch || !quantity || !manufacturerId || !expiryDate) {
        continue; // Skip invalid entries
      }
      
      const id = uuidv4();
      
      const result = await db.query(`
        INSERT INTO medicines 
        (id, name, batch, quantity, manufacturer_id, manufacture_date, expiry_date, added_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [id, name, batch, quantity, manufacturerId, manufactureDate, expiryDate, addedBy]);
      
      results.push(result.rows[0]);
    }
    
    res.status(201).json({ 
      message: `Successfully imported ${results.length} medicines`, 
      medicines: results 
    });
  } catch (error) {
    console.error('Import medicines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
