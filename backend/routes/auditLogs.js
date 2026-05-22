const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all audit logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT al.id, al.action, al.details, al.created_at, u.username
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;