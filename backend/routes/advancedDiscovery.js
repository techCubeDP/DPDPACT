// backend/routes/advancedDiscovery.js

const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('./auth');
const { logAction } = require('../services/auditLog');
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

const router = express.Router();

// Configure AWS SDK for S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// =======================
// MULTI-DATABASE SCANNING
// =======================

// Scan PostgreSQL Database
async function scanPostgreSQL(config) {
  try {
    const pool = new Pool(config);
    const client = await pool.connect();

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = [];

    for (const { table_name } of tablesResult.rows) {
      // Get columns
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table_name]);

      // Get record count
      const countResult = await client.query(`SELECT COUNT(*) FROM "${table_name}"`);

      tables.push({
        database: 'PostgreSQL',
        name: table_name,
        columns: columnsResult.rows.map(r => r.column_name),
        recordCount: parseInt(countResult.rows[0].count),
        type: 'SQL'
      });
    }

    client.release();
    pool.end();
    return tables;
  } catch (error) {
    console.error('PostgreSQL scan error:', error);
    throw error;
  }
}

// Scan MySQL Database
async function scanMySQL(config) {
  try {
    const connection = await mysql.createConnection(config);

    // Get all tables
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [config.database]
    );

    const results = [];

    for (const { TABLE_NAME } of tables) {
      // Get columns
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?`,
        [TABLE_NAME, config.database]
      );

      // Get record count
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM \`${TABLE_NAME}\``);

      results.push({
        database: 'MySQL',
        name: TABLE_NAME,
        columns: columns.map(c => c.COLUMN_NAME),
        recordCount: countResult[0].count,
        type: 'SQL'
      });
    }

    await connection.end();
    return results;
  } catch (error) {
    console.error('MySQL scan error:', error);
    throw error;
  }
}

// =======================
// S3 BUCKET SCANNING
// =======================

// Scan S3 Bucket for PII
async function scanS3Bucket(bucketName, prefix = '') {
  try {
    const s3Objects = [];
    let continuationToken = null;

    // Paginate through S3 objects
    do {
      const params = {
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000
      };

      const response = await s3.listObjectsV2(params).promise();

      if (response.Contents) {
        for (const object of response.Contents) {
          // Skip folders
          if (object.Key.endsWith('/')) continue;

          // Get file extension
          const fileExt = object.Key.split('.').pop().toLowerCase();

          // Determine file type
          let fileType = 'UNKNOWN';
          if (['csv', 'xlsx', 'xls'].includes(fileExt)) fileType = 'SPREADSHEET';
          else if (['json', 'jsonl'].includes(fileExt)) fileType = 'JSON';
          else if (['txt', 'log'].includes(fileExt)) fileType = 'TEXT';
          else if (['pdf'].includes(fileExt)) fileType = 'PDF';
          else if (['sql', 'dump'].includes(fileExt)) fileType = 'DATABASE_DUMP';

          s3Objects.push({
            database: 'AWS S3',
            bucket: bucketName,
            key: object.Key,
            size: object.Size,
            lastModified: object.LastModified,
            fileType: fileType,
            type: 'CLOUD_STORAGE'
          });
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return s3Objects;
  } catch (error) {
    console.error('S3 scan error:', error);
    throw error;
  }
}

// =======================
// API ENDPOINTS
// =======================

// Get configured data sources
router.get('/data-sources', authenticateToken, async (req, res) => {
  try {
    const sources = {
      databases: [
        {
          id: 'main-db',
          name: 'Main PostgreSQL Database',
          type: 'PostgreSQL',
          host: process.env.DB_HOST || 'localhost',
          port: 5432,
          status: 'connected',
          lastScanned: new Date()
        }
      ],
      s3Buckets: [
        {
          id: 's3-docs',
          name: 'Document Storage',
          bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
          region: process.env.AWS_REGION || 'us-east-1',
          status: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not-configured',
          lastScanned: null
        }
      ],
      external: [
        {
          id: 'salesforce',
          name: 'Salesforce CRM',
          type: 'Salesforce',
          status: 'not-configured',
          icon: '☁️'
        },
        {
          id: 'google-workspace',
          name: 'Google Workspace',
          type: 'Google Drive',
          status: 'not-configured',
          icon: '📁'
        },
        {
          id: 'slack',
          name: 'Slack Workspace',
          type: 'Slack',
          status: 'not-configured',
          icon: '💬'
        }
      ]
    };

    res.json(sources);
  } catch (error) {
    console.error('Error getting data sources:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan all available sources
router.post('/scan-all', authenticateToken, async (req, res) => {
  try {
    const results = {
      timestamp: new Date(),
      sources: []
    };

    // Scan main PostgreSQL database
    try {
      console.log('📊 Scanning main PostgreSQL database...');
      const pgTables = await scanPostgreSQL({
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'password',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'dpdp_db'
      });

      results.sources.push({
        name: 'PostgreSQL - Main Database',
        type: 'PostgreSQL',
        status: 'scanned',
        itemCount: pgTables.length,
        tables: pgTables
      });
    } catch (error) {
      console.error('PostgreSQL scan failed:', error);
      results.sources.push({
        name: 'PostgreSQL - Main Database',
        type: 'PostgreSQL',
        status: 'failed',
        error: error.message
      });
    }

    // Scan S3 bucket if configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
      try {
        console.log('🪣 Scanning AWS S3 bucket...');
        const s3Objects = await scanS3Bucket(process.env.AWS_S3_BUCKET);

        results.sources.push({
          name: `AWS S3 - ${process.env.AWS_S3_BUCKET}`,
          type: 'S3',
          status: 'scanned',
          itemCount: s3Objects.length,
          objects: s3Objects
        });
      } catch (error) {
        console.error('S3 scan failed:', error);
        results.sources.push({
          name: `AWS S3 - ${process.env.AWS_S3_BUCKET}`,
          type: 'S3',
          status: 'failed',
          error: error.message
        });
      }
    }

    // Log scan action
    await logAction(req.user.id, 'MULTI_DATABASE_SCAN', {
      sources: results.sources.length,
      timestamp: new Date()
    });

    // Save scan results
    await db.query(
      `INSERT INTO discovery_results (user_id, scan_type, results, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [req.user.id, 'multi-database', JSON.stringify(results)]
    );

    res.json(results);
  } catch (error) {
    console.error('Error scanning all sources:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan specific MySQL database
router.post('/scan-mysql', authenticateToken, async (req, res) => {
  try {
    const { host, port, username, password, database } = req.body;

    if (!host || !username || !password || !database) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const config = {
      host,
      port: parseInt(port || '3306'),
      user: username,
      password,
      database
    };

    console.log(`📊 Scanning MySQL database: ${database}`);
    const tables = await scanMySQL(config);

    // Log action
    await logAction(req.user.id, 'MYSQL_DATABASE_SCAN', {
      host,
      database,
      tableCount: tables.length
    });

    res.json({
      database,
      type: 'MySQL',
      status: 'success',
      tableCount: tables.length,
      tables
    });
  } catch (error) {
    console.error('MySQL scan error:', error);
    res.status(500).json({
      status: 'failed',
      error: error.message
    });
  }
});

// Scan specific S3 bucket
router.post('/scan-s3', authenticateToken, async (req, res) => {
  try {
    const { bucketName, prefix } = req.body;

    if (!bucketName) {
      return res.status(400).json({ error: 'Bucket name required' });
    }

    console.log(`🪣 Scanning S3 bucket: ${bucketName}`);
    const objects = await scanS3Bucket(bucketName, prefix || '');

    // Log action
    await logAction(req.user.id, 'S3_BUCKET_SCAN', {
      bucket: bucketName,
      prefix: prefix || 'root',
      objectCount: objects.length
    });

    res.json({
      bucket: bucketName,
      type: 'S3',
      status: 'success',
      objectCount: objects.length,
      objects
    });
  } catch (error) {
    console.error('S3 scan error:', error);
    res.status(500).json({
      status: 'failed',
      error: error.message
    });
  }
});

// Get scan history
router.get('/scan-history', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM discovery_results 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
