import React, { useState } from 'react';

function DataDiscovery() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discovery/scan', {
        method: 'POST',
      });
      const data = await response.json();
      setInventory(data.data || []);
    } catch (error) {
      console.error('Error scanning:', error);
      alert('Error scanning database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          📊 DPDP Data Discovery
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Scan your databases and discover all personal data locations
        </p>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
          transition: 'background 0.3s'
        }}
      >
        {loading ? '⏳ Scanning...' : '🔍 Scan Database'}
      </button>

      {/* Results */}
      {inventory.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                  Table Name
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                  Records
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                  Has PII
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                  Columns
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '500' }}>
                    {item.table}
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {item.recordCount}
                  </td>
                  <td style={{ padding: '1rem', color: item.hasPII ? '#dc2626' : '#16a34a' }}>
                    {item.hasPII ? '✓ Yes' : '✗ No'}
                  </td>
                  <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                    {item.columns.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inventory.length === 0 && !loading && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Click "Scan Database" to discover your data</p>
        </div>
      )}
    </div>
  );
}

export default DataDiscovery;