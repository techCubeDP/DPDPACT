import React, { useState } from 'react';

function DataDiscovery() {
  const [discoveryResults, setDiscoveryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const scanDatabase = async () => {
    setLoading(true);
    setMessage('🔍 Scanning database...');

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/discovery/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setDiscoveryResults(data);
      setMessage('✅ Scan complete!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
      console.error('Scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPIIClassification = (columnName) => {
    const name = columnName.toLowerCase();

    // CRITICAL
    if (name.includes('password') || name.includes('hash') || name.includes('ssn') || 
        name.includes('aadhar') || name.includes('pan') || name.includes('credit') || 
        name.includes('cvv') || name.includes('salary') || name.includes('private')) {
      return { level: 'CRITICAL', icon: '🔴', color: '#ef4444' };
    }

    // HIGH
    if (name.includes('email') || name.includes('phone') || name.includes('mobile') || 
        name.includes('dob') || name.includes('passport') || name.includes('driver') || 
        name.includes('medical') || name.includes('health')) {
      return { level: 'HIGH', icon: '🟠', color: '#f97316' };
    }

    // MEDIUM
    if (name.includes('address') || name.includes('ip') || name.includes('device') || 
        name.includes('location') || name.includes('gps') || name.includes('latitude') || 
        name.includes('longitude')) {
      return { level: 'MEDIUM', icon: '🟡', color: '#eab308' };
    }

    // SAFE
    if (name.includes('id') || name.includes('name') || name.includes('title') || 
        name.includes('department') || name.includes('status') || name.includes('created') || 
        name.includes('updated')) {
      return { level: 'SAFE', icon: '✅', color: '#22c55e' };
    }

    // UNKNOWN
    return { level: 'UNKNOWN', icon: '❓', color: '#6b7280' };
  };

  const getTableRiskLevel = (columns) => {
    if (!Array.isArray(columns)) return 'LOW';
    
    let hasCritical = false;
    let hasHigh = false;

    for (const col of columns) {
      const classification = getPIIClassification(col.name || col);
      if (classification.level === 'CRITICAL') hasCritical = true;
      if (classification.level === 'HIGH') hasHigh = true;
    }

    if (hasCritical) return 'CRITICAL';
    if (hasHigh) return 'HIGH';
    return 'MEDIUM';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📊 Data Discovery
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Scan your database and discover PII data automatically
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          color: message.includes('✅') ? '#4caf50' : '#f44336',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: message.includes('✅') ? '1px solid #4caf50' : '1px solid #f44336'
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
            background: loading ? '#9ca3af' : 'linear-gradient(90deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {loading ? '⏳ Scanning...' : '🔍 Scan Database'}
        </button>
      </div>

      {/* Results */}
      {discoveryResults && discoveryResults.data && discoveryResults.data.tables && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333', marginTop: 0 }}>
            📋 Discovery Results
          </h2>

          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {discoveryResults.data.tables.length}
              </div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Tables</div>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                {discoveryResults.data.tables.reduce((sum, table) => {
                  return sum + (Array.isArray(table.columns) ? table.columns.filter(c => 
                    getPIIClassification(c.name || c).level === 'CRITICAL'
                  ).length : 0);
                }, 0)}
              </div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>Critical Fields</div>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>
                {discoveryResults.data.tables.reduce((sum, table) => {
                  return sum + (Array.isArray(table.columns) ? table.columns.filter(c => {
                    const level = getPIIClassification(c.name || c).level;
                    return level === 'HIGH' || level === 'CRITICAL';
                  }).length : 0);
                }, 0)}
              </div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>PII Fields</div>
            </div>

            <div style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#666' }}>
                {discoveryResults.data.tables.reduce((sum, table) => {
                  return sum + (Array.isArray(table.columns) ? table.columns.length : 0);
                }, 0)}
              </div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>Total Columns</div>
            </div>
          </div>

          {/* Tables List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {discoveryResults.data.tables.map((table, idx) => {
              const columns = Array.isArray(table.columns) ? table.columns : [];
              const riskLevel = getTableRiskLevel(columns);

              return (
                <div key={idx} style={{
                  background: '#f9f9f9',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ color: '#333', margin: 0, fontSize: '1.1rem' }}>
                      🗂️ {table.name}
                    </h3>
                    <div style={{
                      background: riskLevel === 'CRITICAL' ? '#ef4444' : 
                                 riskLevel === 'HIGH' ? '#f97316' : '#eab308',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {riskLevel} RISK
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                  }}>
                    {columns.map((col, colIdx) => {
                      const colName = col.name || col;
                      const classification = getPIIClassification(colName);
                      return (
                        <div key={colIdx} style={{
                          background: classification.color,
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {classification.icon} {colName}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    📊 {table.recordCount || 0} records | 📋 {columns.length} columns
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classification Legend */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>🎨 Classification Legend</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <strong style={{ color: '#ef4444' }}>🔴 CRITICAL</strong>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Password, SSN, Aadhar, PAN, Credit Card, CVV, Salary
                </p>
              </div>
              <div>
                <strong style={{ color: '#f97316' }}>🟠 HIGH</strong>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Email, Phone, DOB, Passport, Driver License, Medical Data
                </p>
              </div>
              <div>
                <strong style={{ color: '#eab308' }}>🟡 MEDIUM</strong>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Address, IP Address, Device ID, Location, GPS
                </p>
              </div>
              <div>
                <strong style={{ color: '#22c55e' }}>✅ SAFE</strong>
                <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  ID, Name, Title, Department, Status, Timestamps
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!discoveryResults && !loading && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: '#333', marginTop: 0 }}>No Data Discovered Yet</h2>
          <p style={{ color: '#666' }}>
            Click "Scan Database" to discover tables, columns, and identify PII data
          </p>
        </div>
      )}
    </div>
  );
}

export default DataDiscovery;
