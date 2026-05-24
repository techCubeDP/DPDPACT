import React, { useState, useEffect } from 'react';

function FileSharing() {
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchSharedFiles();
    fetchPendingApprovals();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/file-sharing/shared-with-me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setSharedWithMe(data.sharedFiles || data.data || []);
    } catch (error) {
      console.error('Error fetching shared files:', error);
      setSharedWithMe([]);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/file-sharing/approvals/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setPendingApprovals(data.pendingApprovals || data.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setPendingApprovals([]);
    }
  };

  const handleApprove = async (shareId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/file-sharing/approvals/${shareId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('✅ File share approved!');
        fetchPendingApprovals();
        fetchSharedFiles();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (shareId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/file-sharing/approvals/${shareId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage('✅ File share rejected');
        fetchPendingApprovals();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📤 File Sharing & Approvals
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Securely share files between departments with approval workflow
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: message.includes('✅') ? '#86efac' : '#fca5a5',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: message.includes('✅') ? '1px solid #10b981' : '1px solid #ef4444'
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            background: activeTab === 'received' ? '#06b6d4' : '#334155',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          📥 Files Shared With Me ({sharedWithMe.length})
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          style={{
            background: activeTab === 'approvals' ? '#06b6d4' : '#334155',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          ⏳ Pending Approvals ({pendingApprovals.length})
        </button>
      </div>

      {/* Received Files Tab */}
      {activeTab === 'received' && (
        <div style={{
          background: '#1a1f3a',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #06b6d4'
        }}>
          <h2 style={{ color: '#06b6d4', marginBottom: '1rem' }}>📥 Files Shared With Me</h2>

          {sharedWithMe.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No files shared with you yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #06b6d4' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#06b6d4', fontWeight: '600' }}>
                    Filename
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#06b6d4', fontWeight: '600' }}>
                    From
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#06b6d4', fontWeight: '600' }}>
                    Purpose
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#06b6d4', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#06b6d4', fontWeight: '600' }}>
                    Shared Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sharedWithMe.map((share, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #334155', background: 'rgba(6, 182, 212, 0.05)' }}>
                    <td style={{ padding: '1rem', color: '#e2e8f0' }}>📄 {share.filename}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{share.sender_email}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', maxWidth: '300px' }}>
                      {share.purpose}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: share.approval_status === 'approved' ? '#10b98120' : '#06b6d420',
                        color: share.approval_status === 'approved' ? '#86efac' : '#67e8f9',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {share.approval_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {new Date(share.shared_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div style={{
          background: '#1a1f3a',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid #f59e0b'
        }}>
          <h2 style={{ color: '#f59e0b', marginBottom: '1rem' }}>⏳ Pending File Share Approvals</h2>

          {pendingApprovals.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No pending approvals</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingApprovals.map((approval, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0f172a',
                    border: '2px solid #f59e0b',
                    borderRadius: '0.75rem',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>
                        📄 {approval.filename}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: '0.25rem 0' }}>
                        <strong>From:</strong> {approval.sender}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', margin: '0.25rem 0' }}>
                        <strong>Department:</strong> {approval.receiver_dept}
                      </p>
                    </div>
                    <span style={{
                      background: '#f59e0b20',
                      color: '#fbbf24',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      PENDING
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '1rem 0' }}>
                    <strong>Purpose:</strong> {approval.purpose}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: loading ? '#475569' : '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: loading ? '#475569' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileSharing;
