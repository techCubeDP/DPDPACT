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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📊 DPDP Data Discovery</h1>
      
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan Database'}
      </button>

      {inventory.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Table Name</th>
                <th>Records</th>
                <th>Has PII</th>
                <th>Columns</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.table}>
                  <td>{item.table}</td>
                  <td>{item.recordCount}</td>
                  <td>{item.hasPII ? '✓ Yes' : '✗ No'}</td>
                  <td>{item.columns.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataDiscovery;