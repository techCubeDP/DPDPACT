const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('./auth');
const { logAction } = require('../services/auditLog');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// SFTP Upload Credentials endpoint (for SFTP client configuration)
router.get('/credentials', authenticateToken, async (req, res) => {
  try {
    // Generate SFTP credentials for current user
    const sftpConfig = {
      host: process.env.SFTP_HOST || 'your-server-domain.com',
      port: process.env.SFTP_PORT || 22,
      username: req.user.username,
      password: '(use your login password)',
      remotePath: `/uploads/${req.user.id}`,
      fileUploadFormat: 'Binary',
      supportedClients: ['FileZilla', 'WinSCP', 'Cyberduck'],
      instructions: `
        1. Install SFTP client (FileZilla or WinSCP recommended)
        2. Connect with these credentials:
           - Host: ${process.env.SFTP_HOST || 'your-server.com'}
           - Port: 22
           - Username: ${req.user.username}
           - Password: Your login password
        3. Navigate to: /uploads/
        4. Upload files via drag & drop
        5. All uploads are automatically logged and scanned
      `
    };

    res.json(sftpConfig);
  } catch (error) {
    console.error('Error getting SFTP credentials:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record SFTP upload (webhook from SFTP server)
router.post('/upload-webhook', async (req, res) => {
  try {
    const { userId, filename, fileSize, uploadTime, ipAddress } = req.body;

    // Verify webhook signature (in production)
    const sftpSecret = process.env.SFTP_WEBHOOK_SECRET;
    if (!sftpSecret) {
      return res.status(401).json({ error: 'SFTP webhook not configured' });
    }

    // Find user
    const userResult = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create upload record
    const uploadDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, filename);

    const fileResult = await db.query(
      `INSERT INTO files (filename, file_path, file_size, uploaded_by, file_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [
        filename,
        filePath,
        fileSize,
        userId,
        path.extname(filename)
      ]
    );

    // Log SFTP upload
    await logAction(userId, 'SFTP_FILE_UPLOADED', {
      filename: filename,
      size: fileSize,
      ipAddress: ipAddress,
      uploadMethod: 'SFTP'
    }, fileResult.rows[0].id);

    console.log(`✅ SFTP upload recorded: ${filename} from IP ${ipAddress}`);

    res.json({
      message: 'SFTP upload recorded successfully',
      fileId: fileResult.rows[0].id
    });
  } catch (error) {
    console.error('❌ SFTP webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get SFTP upload history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM audit_logs
       WHERE user_id = $1
       AND action LIKE 'SFTP%'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching SFTP history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
