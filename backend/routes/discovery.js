const express = require('express');
const router = express.Router();
const dataDiscovery = require('../services/dataDiscovery');

// Scan database endpoint
router.post('/scan', async (req, res) => {
  try {
    const result = await dataDiscovery.scanDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory endpoint
router.get('/inventory', async (req, res) => {
  try {
    const result = await dataDiscovery.scanDatabase();
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;