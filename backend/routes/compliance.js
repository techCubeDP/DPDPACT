const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all checklist items
router.get('/checklist', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM compliance_items ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update checklist item
router.put('/checklist/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = await db.query(
      `UPDATE compliance_items 
       SET completed = $1, completed_date = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get compliance score
router.get('/score', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed
       FROM compliance_items`
    );

    const { total, completed } = result.rows[0];
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ 
      score, 
      completed: parseInt(completed) || 0, 
      total: parseInt(total) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;