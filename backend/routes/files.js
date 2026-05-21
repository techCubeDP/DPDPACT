const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('./auth');

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

// SIMPLE PII SCAN - NO FILE READING
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
      
      fileContent = fs.readFileSync(file.file_path, 'utf-8', { flag: 'r' }).substring(0, fileSize);
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
    const { receiverDepartmentId, purpose } = req.body;

    const result = await db.query(
      `INSERT INTO file_shares (file_id, sender_id, receiver_department_id, purpose)
       VALUES ($1, $2, $3, $4)
       RETURNING id, approval_status, created_at`,
      [req.params.id, req.user.id, receiverDepartmentId, purpose]
    );

    res.json({
      message: 'File shared successfully',
      share: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;