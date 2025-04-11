
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const auth = require('../middleware/auth');

// Update medicine stock
router.put('/medicines/:medicineId/stock', auth, async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity } = req.body;
    
    // Validate input
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    // Check if medicine exists
    const medicineResult = await db.query('SELECT * FROM medicines WHERE id = $1', [medicineId]);
    if (medicineResult.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const medicine = medicineResult.rows[0];
    const oldQuantity = medicine.quantity;
    const adjustmentAmount = quantity - oldQuantity;
    
    // Update medicine quantity
    await db.query(
      'UPDATE medicines SET quantity = $1 WHERE id = $2',
      [quantity, medicineId]
    );
    
    // Log the adjustment
    const logId = uuidv4();
    await db.query(
      'INSERT INTO stock_logs (id, medicine_id, adjustment_amount, user_id, reason) VALUES ($1, $2, $3, $4, $5)',
      [logId, medicineId, adjustmentAmount, req.user.id, 'Manual stock adjustment']
    );
    
    const updatedMedicine = await db.query('SELECT * FROM medicines WHERE id = $1', [medicineId]);
    
    res.json(updatedMedicine.rows[0]);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate stock report
router.get('/report', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.name, m.batch, m.quantity, m.expiry_date, 
             man.name as manufacturer_name, 
             CASE 
               WHEN m.expiry_date <= CURRENT_DATE THEN 'expired'
               WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring-soon'
               ELSE 'safe'
             END as status
      FROM medicines m
      JOIN manufacturers man ON m.manufacturer_id = man.id
      ORDER BY m.expiry_date ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log stock adjustment
router.post('/log', auth, async (req, res) => {
  try {
    const { medicineId, adjustmentAmount, reason } = req.body;
    
    // Validate input
    if (!medicineId || adjustmentAmount === undefined || isNaN(adjustmentAmount)) {
      return res.status(400).json({ message: 'Valid medicine ID and adjustment amount are required' });
    }
    
    // Check if medicine exists
    const medicineExists = await db.query('SELECT * FROM medicines WHERE id = $1', [medicineId]);
    if (medicineExists.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    // Create log entry
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO stock_logs (id, medicine_id, adjustment_amount, user_id, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, medicineId, adjustmentAmount, req.user.id, reason]
    );
    
    // Update medicine quantity
    const medicine = medicineExists.rows[0];
    const newQuantity = medicine.quantity + adjustmentAmount;
    
    await db.query(
      'UPDATE medicines SET quantity = $1 WHERE id = $2',
      [newQuantity < 0 ? 0 : newQuantity, medicineId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Log stock adjustment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
