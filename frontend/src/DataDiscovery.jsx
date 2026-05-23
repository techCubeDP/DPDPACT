import React, { useState } from 'react';

function DataDiscovery() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedTable, setExpandedTable] = useState(null);

  // PII Classification function
  const classifyColumn = (columnName) => {
    if (!columnName) {
      return {
        isPii: false,
        severity: 'NONE',
        label: '❓ UNKNOWN',
        color: '#94a3b8',
        bgColor: 'rgba(148, 163, 184, 0.2)'
      };
    }

    const lower = columnName.toLowerCase();

    // Critical
    if (['password', 'hash', 'ssn', 'aadhar', 'pan', 'credit_card', 'cvv', 'salary', 'private_key', 'secret'].some(r => lower.includes(r))) {
      return {
        isPii: true,
        severity: 'CRITICAL',
        label: '🔴 CRITICAL',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.2)'
      };
    }

    // High
    if (['email', 'phone', 'mobile', 'dob', 'date_of_birth', 'passport', 'driver_license', 'medical', 'health'].some(r => lower.includes(r))) {
      return {
        isPii: true,
        severity: 'HIGH',
        label: '🟠 HIGH',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)'
      };
    }

    // Medium
    if (['address', 'ip_address', 'ip', 'device_id', 'location', 'gps', 'latitude', 'longitude'].some(r => lower.includes(r))) {
      return {
        isPii: true,
        severity: 'MEDIUM',
        label: '🟡 MEDIUM',
        color: '#eab308',
        bgColor: 'rgba(234, 179, 8, 0.2)'
      };
    }

    // Safe
    if (['id', 'name', 'title', 'department', 'status', 'created_at', 'updated_at', 'deleted_at', 'is_active', 'type', 'category'].some(r => lower.includes(r))) {
      return {
        isPii: false,
        severity: 'NONE',
        label: '✅ SAFE',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.2)'
      };
    }

    // Default: REVIEW
    return {
      isPii: false,
      severity: 'UNKNOWN',
      label: '❓ REVIEW',
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.2)'
    };
  };

  const classifyTable = (tableName, columns) => {
    if (!Array.isArray(columns)) {
      columns = [];
    }

    const classified = columns.map(col => ({
      name: col,
      ...classifyColumn(col)
    }));

    const piiCount = classified.filter(c => c.isPii).length;
    const criticalCount = classified.filter(c => c.severity === 'CRITICAL').length;
    const highCount = classified.filter(c => c.severity === 'HIGH').length;

    let tableRisk = 'LOW';
    if (criticalCount > 0) tableRisk = 'CRITICAL';
    else if (highCount > 0) tableRisk = 'HIGH';
    else if (piiCount > 0) tableRisk = 'MEDIUM';

    return {
      columns: classified,
      piiCount,
      criticalCount,
      highCount,
      totalColumns: columns.length,
      tableRisk,
      piiPercentage: columns.length > 0 ? Math.round((piiCount / columns.length) * 100) : 0
    };
  };

  const scanDatabase = async () => {
    setLoading(true);
    setMessage('🔍 Scanning database...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/discovery/scan', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle different response formats
      let tablesData = [];
      
      if (Array.isArray(data)) {
        // If response is an array directly
        tablesData = data;
      } else if (data.tables && Array.isArray(data.tables)) {
        // If response has tables property
        tablesData = data.tables;
      } else if (data.data && Array.isArray(data.data)) {
        // If response has data property
        tablesData = data.data;
      }

      if (tablesData.length === 0) {
        setMessage('✅ Scan complete! No tables found.');
        setTables([]);
        return;
      }

      // Classify each table
      const classifiedTables = tablesData.map(table => {
        let tableName = '';
        let columns = [];
        let records = 0;

        // Handle different table object formats
        if (typeof table === 'string') {
          tableName = table;
          columns = [];
        } else if (table.table) {
          tableName = table.table;
          columns = table.columns || [];
          records = table.recordCount || 0;
        } else if (table.name) {
          tableName = table.name;
          columns = table.columns || [];
          records = table.records || 0;
        } else if (table.tableName) {
          tableName = table.tableName;
          columns = table.columns || [];
          records = table.records || 0;
        }

        const classified = classifyTable(tableName, columns);
        return {
          name: tableName,
          recordCount: records,
          ...classified
        };
      });

      setTables(classifiedTables);
      setMessage(`✅ Scan complete! Found ${classifiedTables.length} tables`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📊 Data Discovery & Classification
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Automatic database scanning with intelligent PII detection
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          color: message.includes('✅') ? '#86efac' : '#93c5fd',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: message.includes('✅') ? '1px solid #10b981' : '1px solid #3b82f6'
        }}>
          {message}
        </div>
      )}

      {/* Scan Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={scanDatabase}
          disabled={loading}
          style={{
            background: loading ? '#475569' : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳ Scanning...' : '🔍 Scan Database'}
        </button>
      </div>

      {/* Classification Legend */}
      <div style={{
        background: '#1a1f3a',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>📋 Classification Legend</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ color: '#fca5a5', fontWeight: '600', marginBottom: '0.5rem' }}>🔴 CRITICAL</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Password, SSN, Credit Card, Salary</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ color: '#fcd34d', fontWeight: '600', marginBottom: '0.5rem' }}>🟠 HIGH</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Email, Phone, DOB, Passport</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.2)', borderRadius: '0.5rem', borderLeft: '4px solid #eab308' }}>
            <div style={{ color: '#fde047', fontWeight: '600', marginBottom: '0.5rem' }}>🟡 MEDIUM</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Address, IP Address, Location</div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: '#86efac', fontWeight: '600', marginBottom: '0.5rem' }}>✅ SAFE</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>ID, Name, Department, Status</div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div style={{
        background: '#1a1f3a',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: '1px solid #334155'
      }}>
        {tables.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            Click "Scan Database" to discover tables and their PII classification
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>📂 Discovered Tables ({tables.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tables.map((table, idx) => (
                <div key={idx} style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  overflow: 'hidden'
                }}>
                  {/* Table Header */}
                  <div
                    onClick={() => setExpandedTable(expandedTable === idx ? null : idx)}
                    style={{
                      padding: '1.5rem',
                      background: table.tableRisk === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : table.tableRisk === 'HIGH' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      borderBottom: expandedTable === idx ? '1px solid #334155' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h3 style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                        {table.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                          📊 {table.totalColumns} columns
                        </span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                          📋 {table.recordCount} records
                        </span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                          🔒 {table.piiCount} PII ({table.piiPercentage}%)
                        </span>
                        {table.criticalCount > 0 && (
                          <span style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: '600' }}>
                            🔴 {table.criticalCount} CRITICAL
                          </span>
                        )}
                        {table.highCount > 0 && (
                          <span style={{ color: '#fcd34d', fontSize: '0.875rem', fontWeight: '600' }}>
                            🟠 {table.highCount} HIGH
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: table.tableRisk === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : table.tableRisk === 'HIGH' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      borderRadius: '0.5rem',
                      color: table.tableRisk === 'CRITICAL' ? '#fca5a5' : table.tableRisk === 'HIGH' ? '#fcd34d' : '#86efac',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      Risk: {table.tableRisk}
                    </div>
                  </div>

                  {/* Expanded Columns */}
                  {expandedTable === idx && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #334155' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {table.columns && table.columns.map((col, cIdx) => (
                          <div key={cIdx} style={{
                            padding: '1rem',
                            background: col.bgColor,
                            border: `1px solid ${col.color}`,
                            borderRadius: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '600', color: col.color }}>{col.label}</span>
                            </div>
                            <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              {col.name}
                            </div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                              {col.isPii ? '🔒 Contains PII' : '✅ Safe column'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Risk Assessment */}
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderLeft: '4px solid #10b981',
                        borderRadius: '0.5rem'
                      }}>
                        <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>🎯 Recommendation:</h4>
                        <div style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6' }}>
                          {table.tableRisk === 'CRITICAL' && (
                            <>
                              <strong>⚠️ IMMEDIATE ACTION REQUIRED</strong>
                              <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>Encrypt all CRITICAL fields immediately</li>
                                <li>Implement strict access controls</li>
                                <li>Add audit logging for all access</li>
                              </ul>
                            </>
                          )}
                          {table.tableRisk === 'HIGH' && (
                            <>
                              <strong>⚠️ HIGH PRIORITY</strong>
                              <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                                <li>Encrypt sensitive fields</li>
                                <li>Limit data access to authorized personnel</li>
                              </ul>
                            </>
                          )}
                          {table.tableRisk === 'LOW' && (
                            <>
                              <strong>✅ LOW RISK - Standard security practices apply</strong>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {tables.length > 0 && (
        <div style={{
          marginTop: '2rem',
          background: '#1a1f3a',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>📈 Overall Statistics</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>{tables.length}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Total Tables</div>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#ef4444', fontWeight: 'bold' }}>
                {tables.reduce((sum, t) => sum + t.criticalCount, 0)}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Critical Fields</div>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#f59e0b', fontWeight: 'bold' }}>
                {tables.reduce((sum, t) => sum + t.piiCount, 0)}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>PII Fields Found</div>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>
                {tables.reduce((sum, t) => sum + t.totalColumns, 0)}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Total Columns</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataDiscovery;
