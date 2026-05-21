const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, description FROM departments ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;