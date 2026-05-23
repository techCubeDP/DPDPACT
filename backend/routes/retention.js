const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('./auth');
const { logAction } = require('../services/auditLog');
const fs = require('fs');

const router = express.Router();

// Set file retention
router.post('/:fileId/set-retention', authenticateToken, async (req, res) => {
  try {
    const { retentionDays } = req.body;
    const { fileId } = req.params;

    if (!retentionDays || retentionDays < 1) {
      return res.status(400).json({ error: 'Invalid retention days' });
    }

    // Calculate deletion date
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + parseInt(retentionDays));

    const result = await db.query(
      `INSERT INTO file_retention (file_id, retention_days, deletion_scheduled_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (file_id) DO UPDATE
       SET retention_days = $2, deletion_scheduled_at = $3, created_at = NOW()
       RETURNING *`,
      [fileId, retentionDays, deletionDate]
    );

    // Log action
    await logAction(req.user.id, 'RETENTION_SET', {
      fileId: fileId,
      retentionDays: retentionDays,
      deletionScheduledAt: deletionDate
    }, fileId);

    console.log(`✅ Retention set: ${retentionDays} days for file ${fileId}`);

    res.json({
      message: 'Retention period set successfully',
      retention: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error setting retention:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get retention info for file
router.get('/:fileId/retention-info', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fr.*, f.filename
       FROM file_retention fr
       JOIN files f ON fr.file_id = f.id
       WHERE fr.file_id = $1`,
      [req.params.fileId]
    );

    if (result.rows.length === 0) {
      return res.json({
        fileId: req.params.fileId,
        retention_days: null,
        deletion_scheduled_at: null,
        days_remaining: null,
        status: 'no_retention'
      });
    }

    const retention = result.rows[0];
    const now = new Date();
    const daysRemaining = Math.ceil(
      (new Date(retention.deletion_scheduled_at) - now) / (1000 * 60 * 60 * 24)
    );

    res.json({
      fileId: req.params.fileId,
      filename: retention.filename,
      retention_days: retention.retention_days,
      deletion_scheduled_at: retention.deletion_scheduled_at,
      days_remaining: Math.max(0, daysRemaining),
      status: daysRemaining <= 0 ? 'expired' : 'active',
      created_at: retention.created_at
    });
  } catch (error) {
    console.error('Error getting retention info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all files with expiring soon
router.get('/summary/expiring-soon', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT f.id, f.filename, fr.retention_days, fr.deletion_scheduled_at,
              CEIL(EXTRACT(DAY FROM fr.deletion_scheduled_at - NOW())) as days_remaining
       FROM file_retention fr
       JOIN files f ON fr.file_id = f.id
       WHERE fr.deletion_scheduled_at > NOW()
       AND EXTRACT(DAY FROM fr.deletion_scheduled_at - NOW()) <= 7
       ORDER BY fr.deletion_scheduled_at ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting expiring files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete expired files (scheduled job)
router.post('/cleanup/delete-expired', authenticateToken, async (req, res) => {
  try {
    // Get all expired files
    const expiredResult = await db.query(
      `SELECT f.id, f.filename, f.file_path
       FROM files f
       JOIN file_retention fr ON f.id = fr.file_id
       WHERE fr.deletion_scheduled_at < NOW()
       AND fr.deleted_at IS NULL`
    );

    const expiredFiles = expiredResult.rows;
    let deletedCount = 0;

    // Delete each file
    for (const file of expiredFiles) {
      try {
        // Delete from filesystem
        if (fs.existsSync(file.file_path)) {
          fs.unlinkSync(file.file_path);
        }

        // Mark as deleted in database
        await db.query(
          `UPDATE file_retention
           SET deleted_at = NOW()
           WHERE file_id = $1`,
          [file.id]
        );

        // Log deletion
        await logAction(req.user.id, 'FILE_AUTO_DELETED', {
          filename: file.filename,
          reason: 'retention_period_expired'
        }, file.id);

        deletedCount++;
        console.log(`✅ Deleted expired file: ${file.filename}`);
      } catch (error) {
        console.error(`❌ Error deleting file ${file.filename}:`, error);
      }
    }

    res.json({
      message: `${deletedCount} expired files deleted`,
      deletedCount: deletedCount
    });
  } catch (error) {
    console.error('❌ Error in cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual file deletion
router.delete('/:fileId/delete-now', authenticateToken, async (req, res) => {
  try {
    const fileResult = await db.query(
      'SELECT id, filename, file_path FROM files WHERE id = $1',
      [req.params.fileId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileResult.rows[0];

    // Delete from filesystem
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Mark as deleted in retention
    await db.query(
      `UPDATE file_retention
       SET deleted_at = NOW()
       WHERE file_id = $1`,
      [file.id]
    );

    // Log deletion
    await logAction(req.user.id, 'FILE_MANUALLY_DELETED', {
      filename: file.filename,
      reason: 'manual_deletion'
    }, file.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
