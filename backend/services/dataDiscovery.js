const db = require('../config/database');

class DataDiscoveryService {
  // Scan PostgreSQL database for tables and PII
  async scanDatabase(dbConfig = {}) {
    try {
      // Get all tables from current database
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      const tablesResult = await db.query(tablesQuery);
      const tables = tablesResult.rows;

      if (tables.length === 0) {
        return {
          success: true,
          message: 'No tables found in database',
          data: [],
        };
      }

      const results = [];

      // Scan each table
      for (const table of tables) {
        const tableName = table.table_name;

        try {
          // Get column information
          const columnsQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}'
          `;
          const columnsResult = await db.query(columnsQuery);
          const columns = columnsResult.rows.map(c => c.column_name);

          // Get record count
          const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
          const countResult = await db.query(countQuery);
          const recordCount = parseInt(countResult.rows[0].count);

          // Sample data to detect PII
          let hasPII = false;
          if (recordCount > 0) {
            const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 10`;
            const sampleResult = await db.query(sampleQuery);
            hasPII = this.detectPII(sampleResult.rows);
          }

          results.push({
            table: tableName,
            recordCount,
            columns,
            hasPII,
            scanTime: new Date(),
          });
        } catch (error) {
          console.error(`Error scanning table ${tableName}:`, error.message);
          results.push({
            table: tableName,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        totalTables: results.length,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Detect PII patterns in data
  detectPII(rows) {
    if (!rows || rows.length === 0) return false;

    const piiPatterns = {
      email: /@/,
      phone: /\d{10}/,
      pan: /[A-Z]{5}[0-9]{4}[A-Z]/,
      aadhar: /\d{12}/,
    };

    for (const row of rows) {
      for (const value of Object.values(row)) {
        const str = String(value);
        for (const pattern of Object.values(piiPatterns)) {
          if (pattern.test(str)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

module.exports = new DataDiscoveryService();