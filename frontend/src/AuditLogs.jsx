import React, { useState, useEffect } from 'react';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'FILE_UPLOADED': '📤 File Uploaded',
      'FILE_SHARED': '🔄 File Shared',
      'SHARE_APPROVED': '✅ Share Approved',
      'SHARE_REJECTED': '❌ Share Rejected',
      'LOGIN': '🔓 Login',
      'LOGOUT': '🔒 Logout'
    };
    return labels[action] || action;
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          📋 Audit Logs
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Complete activity history and compliance trail
        </p>
      </div>

      {logs.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#999'
        }}>
          No audit logs yet
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Time</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Action</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {getActionLabel(log.action)}
                  </td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {log.username}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details).substring(0, 50)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;