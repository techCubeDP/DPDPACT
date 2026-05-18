const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Create breach alert
router.post('/create', async (req, res) => {
  try {
    const { title, severity, description, affectedRecords } = req.body;

    // Validate input
    if (!title || !description || !affectedRecords) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, affectedRecords' 
      });
    }

    const result = await db.query(
      `INSERT INTO breach_alerts (title, severity, description, affected_records, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING *`,
      [title, severity, description, affectedRecords]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating breach:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all breaches
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM breach_alerts ORDER BY detected_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single breach
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM breach_alerts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breach not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate DPB notification letter
router.post('/:id/generate-letter', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM breach_alerts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breach not found' });
    }

    const breach = result.rows[0];

    const letter = `
================================================================================
                DATA PROTECTION BOARD NOTIFICATION LETTER
                      DPDP ACT, 2023 - BREACH NOTIFICATION
================================================================================

TO: Data Protection Board of India
    New Delhi

FROM: [Your Organization Name]

DATE: ${new Date(breach.detected_at).toLocaleDateString('en-IN')}

SUBJECT: Notification of Personal Data Breach

================================================================================
                            BREACH DETAILS
================================================================================

1. INCIDENT INFORMATION:
   
   Breach Title: ${breach.title}
   Date of Discovery: ${new Date(breach.detected_at).toLocaleDateString('en-IN')}
   Severity Level: ${breach.severity.toUpperCase()}
   Status: ${breach.status.toUpperCase()}

2. DATA BREACH DESCRIPTION:

   ${breach.description}

3. SCALE OF THE BREACH:

   Number of Individuals Affected: ${breach.affected_records}
   
4. TYPES OF PERSONAL DATA INVOLVED:

   Personal Identifiable Information (PII) including:
   - Names
   - Email Addresses
   - Phone Numbers
   - Identification Numbers

5. IMPACT ASSESSMENT:

   This breach may affect the personal data security of the above number
   of individuals and requires immediate notification as per Section 6(2)
   of the Digital Personal Data Protection Act, 2023.

6. IMMEDIATE ACTIONS TAKEN:

   ✓ Breach has been isolated and contained
   ✓ Incident response team has been activated
   ✓ Forensic investigation is in progress
   ✓ Affected individuals are being notified
   ✓ Remedial measures are being implemented

7. MEASURES TO PREVENT RECURRENCE:

   - Enhanced security controls will be implemented
   - Staff training will be conducted
   - System audits will be performed
   - Data access controls will be reviewed

8. NOTIFICATION STATUS:

   All affected individuals will be notified immediately with:
   - Details of the breach
   - Steps they should take
   - Contact information for support

================================================================================
                          COMPLIANCE STATEMENT
================================================================================

This notification is submitted in compliance with:
- Digital Personal Data Protection Act, 2023
- Rules framed under DPDP Act, 2025
- Data Protection Board Guidelines

Submitted for urgent review and investigation.

================================================================================
                              CONTACT DETAILS
================================================================================

For Further Information:
Data Protection Officer (DPO)
[Organization Name]
Email: dpo@[organization].in
Phone: [Contact Number]

================================================================================
                            AUTHORIZATION
================================================================================

This notification is submitted on behalf of [Organization Name]
as authorized data processor.

Signed and Submitted on: ${new Date().toLocaleDateString('en-IN')}

________________________________________________________________________________

NOTE: This is a computer-generated letter. The organization's official 
seal/signature and Data Protection Officer's digital signature should be 
affixed before submission to the Data Protection Board.

================================================================================
    `;

    res.json({ 
      letter: letter.trim(),
      breachId: id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update breach status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE breach_alerts SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Breach not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;