const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('./auth');
const { logAction } = require('../services/auditLog');

const router = express.Router();

// Create uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    console.log('✅ File upload started:', req.file.originalname);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save to database
    const result = await db.query(
      `INSERT INTO files (filename, file_path, file_size, uploaded_by, file_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, filename, file_size, created_at`,
      [
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.user.id,
        path.extname(req.file.originalname)
      ]
    );

    const fileId = result.rows[0].id;
    console.log('✅ File saved to DB:', fileId);

    // Log the action
    await logAction(req.user.id, 'FILE_UPLOADED', {
      filename: req.file.originalname,
      size: req.file.size,
      type: path.extname(req.file.originalname)
    }, fileId);

    res.json({
      message: 'File uploaded successfully',
      fileId: fileId,
      file: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my files
router.get('/my-files', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, filename, file_size, created_at FROM files 
       WHERE uploaded_by = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan file for PII
router.post('/:id/scan-pii', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 PII scan started for file:', req.params.id);

    const fileResult = await db.query(
      'SELECT filename, file_path FROM files WHERE id = $1',
      [req.params.id]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileResult.rows[0];
    console.log('📄 Scanning file:', file.filename);

    let fileContent = '';

    // Try to read file content
    try {
      // Check if file exists
      if (!fs.existsSync(file.file_path)) {
        console.warn('⚠️ File not found at:', file.file_path);
        return res.json({
          hasPII: false,
          totalDetected: 0,
          detections: {},
          message: 'File could not be read'
        });
      }

      // Read file (first 500KB)
      const stats = fs.statSync(file.file_path);
      const fileSize = Math.min(stats.size, 500 * 1024); // 500KB max
      
      fileContent = fs.readFileSync(file.file_path, 'utf-8').substring(0, fileSize);
      console.log('✅ File content read:', fileContent.length, 'characters');
    } catch (readError) {
      console.warn('⚠️ Could not read file as text:', readError.message);
      // If can't read, return no PII
      return res.json({
        hasPII: false,
        totalDetected: 0,
        detections: {},
        message: 'Binary file - PII scan skipped'
      });
    }

    // PII Detection Patterns
    const patterns = {
      aadhaar: {
        pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
        label: 'Aadhaar Number',
        description: '12-digit Aadhaar ID'
      },
      pan: {
        pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
        label: 'PAN',
        description: 'Permanent Account Number'
      },
      email: {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        label: 'Email Address',
        description: 'Email contact information'
      },
      phone: {
        pattern: /\b(?:\+91|0)?[6-9]\d{9}\b/g,
        label: 'Phone Number',
        description: 'Mobile/Phone number'
      },
      ssn: {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        label: 'SSN',
        description: 'Social Security Number'
      },
      creditcard: {
        pattern: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
        label: 'Credit Card',
        description: 'Credit card number'
      },
      passport: {
        pattern: /\b[A-Z]{1}\d{7}\b/g,
        label: 'Passport',
        description: 'Passport number'
      },
      dob: {
        pattern: /\b(0?[1-9]|[12][0-9]|3[01])[\/-](0?[1-9]|1[012])[\/-](19|20)?\d{2}\b/g,
        label: 'Date of Birth',
        description: 'Birth date (DD/MM/YYYY format)'
      }
    };

    const detections = {};
    let totalDetected = 0;

    // Scan for each PII type
    for (const [key, config] of Object.entries(patterns)) {
      try {
        const matches = fileContent.match(config.pattern) || [];
        
        if (matches.length > 0) {
          detections[key] = {
            label: config.label,
            description: config.description,
            count: matches.length,
            samples: [...new Set(matches)].slice(0, 2) // Get unique samples
          };
          totalDetected += matches.length;
          console.log(`✅ Found ${matches.length} ${config.label}`);
        }
      } catch (patternError) {
        console.warn(`⚠️ Error scanning for ${key}:`, patternError.message);
      }
    }

    console.log(`✅ PII scan complete: ${totalDetected} elements found`);

    res.json({
      hasPII: totalDetected > 0,
      totalDetected: totalDetected,
      detections: detections
    });

  } catch (error) {
    console.error('❌ Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Share file
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 File share initiated');
    const { receiverDepartmentId, purpose } = req.body;

    if (!receiverDepartmentId || !purpose) {
      return res.status(400).json({ error: 'Department and purpose required' });
    }

    const result = await db.query(
      `INSERT INTO file_shares (file_id, sender_id, receiver_department_id, purpose, approval_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, approval_status, created_at`,
      [req.params.id, req.user.id, receiverDepartmentId, purpose]
    );

    const shareId = result.rows[0].id;
    console.log('✅ Share created:', shareId);

    // Log the action
    await logAction(req.user.id, 'FILE_SHARED', {
      receiverDepartmentId: receiverDepartmentId,
      purpose: purpose,
      shareId: shareId
    }, req.params.id);

    res.json({
      message: 'File shared successfully',
      share: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Share error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals (only for user's department)
router.get('/approvals/pending', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching approvals for user:', req.user.id);

    // Get current user's department
    const userResult = await db.query(
      'SELECT department FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDepartment = userResult.rows[0].department;
    console.log('👤 User department:', userDepartment);

    // Get files shared to user's department (both pending and approved)
    const result = await db.query(
      `SELECT fs.id, f.id as file_id, f.filename, u.username as sender, d.name as receiver_dept, 
              fs.purpose, fs.approval_status, fs.created_at
       FROM file_shares fs
       JOIN files f ON fs.file_id = f.id
       JOIN users u ON fs.sender_id = u.id
       JOIN departments d ON fs.receiver_department_id = d.id
       WHERE d.name = $1
       AND fs.approval_status IN ('pending', 'approved')
       ORDER BY fs.created_at DESC`,
      [userDepartment]
    );

    console.log('✅ Found', result.rows.length, 'shares');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching approvals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve or reject share
router.put('/:shareId/approve', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Approval request:', req.body.approved ? 'APPROVE' : 'REJECT');

    const result = await db.query(
      `UPDATE file_shares 
       SET approval_status = $1, approved_by = $2, approved_at = NOW()
       WHERE id = $3
       RETURNING id, approval_status`,
      [req.body.approved ? 'approved' : 'rejected', req.user.id, req.params.shareId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share not found' });
    }

    console.log('✅ Share updated:', result.rows[0]);

    // Log the action
    const action = req.body.approved ? 'SHARE_APPROVED' : 'SHARE_REJECTED';
    await logAction(req.user.id, action, {
      shareId: req.params.shareId,
      status: req.body.approved ? 'approved' : 'rejected'
    });

    res.json({ share: result.rows[0] });
  } catch (error) {
    console.error('❌ Approval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download approved file - CORRECTED VERSION
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Download request for share ID:', req.params.id);
    console.log('User ID:', req.user.id);

    // Get user's department
    const userResult = await db.query(
      'SELECT department FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      console.warn('⚠️ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const userDepartment = userResult.rows[0].department;
    console.log('👤 User department:', userDepartment);

    // Get file from file_shares using share ID (not file ID)
    const fileResult = await db.query(
      `SELECT f.id, f.filename, f.file_path, fs.approval_status
       FROM files f
       INNER JOIN file_shares fs ON f.id = fs.file_id
       INNER JOIN departments d ON fs.receiver_department_id = d.id
       WHERE fs.id = $1
       AND d.name = $2
       AND fs.approval_status = 'approved'`,
      [req.params.id, userDepartment]
    );

    console.log('📊 File query result rows:', fileResult.rows.length);

    if (fileResult.rows.length === 0) {
      console.warn('⚠️ File not found or not approved for this user');
      console.warn('  Share ID:', req.params.id);
      console.warn('  Department:', userDepartment);
      return res.status(403).json({ error: 'File not approved for download or access denied' });
    }

    const file = fileResult.rows[0];
    console.log('📄 File found:', file.filename);
    console.log('📁 File path:', file.file_path);

    // Check if file path exists
    if (!file.file_path) {
      console.error('❌ File path is null');
      return res.status(404).json({ error: 'File path invalid' });
    }

    if (!fs.existsSync(file.file_path)) {
      console.error('❌ File does not exist at:', file.file_path);
      return res.status(404).json({ error: 'File not found on server' });
    }

    console.log('✅ Sending file:', file.filename);

    // Log download action
    await logAction(req.user.id, 'FILE_DOWNLOADED', {
      filename: file.filename,
      fileId: file.id,
      shareId: req.params.id
    }, file.id);

    // Send file for download
    res.download(file.file_path, file.filename, (err) => {
      if (err) {
        console.error('❌ Download stream error:', err);
      } else {
        console.log('✅ Download complete for:', file.filename);
      }
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;