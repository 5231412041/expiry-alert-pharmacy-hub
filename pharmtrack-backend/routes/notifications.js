
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const auth = require('../middleware/auth');

// Add notification
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, type } = req.body;
    
    // Validate input
    if (!medicineId || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if medicine exists
    const medicineExists = await db.query('SELECT * FROM medicines WHERE id = $1', [medicineId]);
    if (medicineExists.rows.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    // Get type ID
    const typeResult = await db.query('SELECT id FROM notification_types WHERE name = $1', [type]);
    if (typeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }
    const typeId = typeResult.rows[0].id;
    
    // Get status ID for pending
    const statusResult = await db.query('SELECT id FROM notification_statuses WHERE name = $1', ['pending']);
    const statusId = statusResult.rows[0].id;
    
    const medicine = medicineExists.rows[0];
    const message = `Medicine ${medicine.name} (Batch: ${medicine.batch}) is expiring on ${new Date(medicine.expiry_date).toLocaleDateString()}`;
    
    const id = uuidv4();
    const result = await db.query(`
      INSERT INTO notifications 
      (id, medicine_id, type_id, status_id, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, medicineId, typeId, statusId, message]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT n.*, nt.name as type, ns.name as status, m.name as medicine_name
      FROM notifications n
      JOIN notification_types nt ON n.type_id = nt.id
      JOIN notification_statuses ns ON n.status_id = ns.id
      JOIN medicines m ON n.medicine_id = m.id
      ORDER BY n.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications by medicine
router.get('/medicine/:medicineId', auth, async (req, res) => {
  try {
    const { medicineId } = req.params;
    
    const result = await db.query(`
      SELECT n.*, nt.name as type, ns.name as status
      FROM notifications n
      JOIN notification_types nt ON n.type_id = nt.id
      JOIN notification_statuses ns ON n.status_id = ns.id
      WHERE n.medicine_id = $1
      ORDER BY n.created_at DESC
    `, [medicineId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications by medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as sent
router.put('/:id/sent', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if notification exists
    const notificationExists = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
    if (notificationExists.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Get status ID for sent
    const statusResult = await db.query('SELECT id FROM notification_statuses WHERE name = $1', ['sent']);
    const statusId = statusResult.rows[0].id;
    
    const result = await db.query(`
      UPDATE notifications
      SET status_id = $1, sent_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [statusId, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark notification as sent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as failed
router.put('/:id/failed', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if notification exists
    const notificationExists = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
    if (notificationExists.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Get status ID for failed
    const statusResult = await db.query('SELECT id FROM notification_statuses WHERE name = $1', ['failed']);
    const statusId = statusResult.rows[0].id;
    
    const result = await db.query(`
      UPDATE notifications
      SET status_id = $1
      WHERE id = $2
      RETURNING *
    `, [statusId, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark notification as failed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process pending notifications
router.post('/process', auth, async (req, res) => {
  try {
    // Get pending notifications
    const pendingResult = await db.query(`
      SELECT n.*, nt.name as type_name
      FROM notifications n
      JOIN notification_statuses ns ON n.status_id = ns.id
      JOIN notification_types nt ON n.type_id = nt.id
      WHERE ns.name = 'pending'
    `);
    
    const pendingNotifications = pendingResult.rows;
    const processed = [];
    
    // In a real application, you would send actual emails or WhatsApp messages here
    // For this example, we'll just mark them as sent
    
    for (const notification of pendingNotifications) {
      // Get status ID for sent
      const statusResult = await db.query('SELECT id FROM notification_statuses WHERE name = $1', ['sent']);
      const statusId = statusResult.rows[0].id;
      
      await db.query(`
        UPDATE notifications
        SET status_id = $1, sent_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [statusId, notification.id]);
      
      processed.push(notification.id);
    }
    
    res.json({ 
      message: `Successfully processed ${processed.length} notifications`,
      processed
    });
  } catch (error) {
    console.error('Process notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule automated notifications
router.post('/schedule', auth, async (req, res) => {
  try {
    const { interval, time } = req.body;
    
    // Validate input
    if (!interval || !time) {
      return res.status(400).json({ message: 'Interval and time are required' });
    }
    
    // In a real application, you would set up a cron job or scheduled task here
    // For this example, we'll just return a success message
    
    res.json({ 
      message: 'Notification schedule set successfully',
      schedule: { interval, time }
    });
  } catch (error) {
    console.error('Schedule notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all recipients
router.get('/recipients', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, array_agg(rc.contact_type || ':' || rc.contact_value) as contacts
      FROM recipients r
      LEFT JOIN recipient_contacts rc ON r.id = rc.recipient_id
      GROUP BY r.id
      ORDER BY r.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add recipient
router.post('/recipients', auth, async (req, res) => {
  try {
    const { name, email, contacts, roleId } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const id = uuidv4();
    await db.query(
      'INSERT INTO recipients (id, name, email) VALUES ($1, $2, $3)',
      [id, name, email]
    );
    
    // Add contacts if provided
    if (contacts && Array.isArray(contacts)) {
      for (const contact of contacts) {
        const { type, value, isPrimary } = contact;
        await db.query(
          'INSERT INTO recipient_contacts (recipient_id, contact_type, contact_value, is_primary) VALUES ($1, $2, $3, $4)',
          [id, type, value, isPrimary || false]
        );
      }
    }
    
    // Add role if provided
    if (roleId) {
      await db.query(
        'INSERT INTO recipient_roles (recipient_id, role_id) VALUES ($1, $2)',
        [id, roleId]
      );
    }
    
    const result = await db.query('SELECT * FROM recipients WHERE id = $1', [id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add recipient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recipient
router.put('/recipients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Check if recipient exists
    const recipientExists = await db.query('SELECT * FROM recipients WHERE id = $1', [id]);
    if (recipientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    await db.query(
      'UPDATE recipients SET name = $1, email = $2 WHERE id = $3',
      [name, email, id]
    );
    
    const result = await db.query('SELECT * FROM recipients WHERE id = $1', [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recipient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete recipient
router.delete('/recipients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if recipient exists
    const recipientExists = await db.query('SELECT * FROM recipients WHERE id = $1', [id]);
    if (recipientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Delete associated records first
    await db.query('DELETE FROM recipient_contacts WHERE recipient_id = $1', [id]);
    await db.query('DELETE FROM recipient_roles WHERE recipient_id = $1', [id]);
    await db.query('DELETE FROM recipient_preferences WHERE recipient_id = $1', [id]);
    
    // Delete recipient
    await db.query('DELETE FROM recipients WHERE id = $1', [id]);
    
    res.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Delete recipient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
