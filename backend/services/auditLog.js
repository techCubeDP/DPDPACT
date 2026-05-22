const db = require('../config/database');

async function logAction(userId, action, details, fileId = null) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, file_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, action, JSON.stringify(details), fileId]
    );
    console.log(`📝 Audit: ${action} by user ${userId}`);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

module.exports = { logAction };