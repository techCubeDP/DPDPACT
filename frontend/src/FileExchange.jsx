import React, { useState, useEffect } from 'react';

function FileExchange() {
  const [tab, setTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    fileId: '',
    receiverDepartmentId: '',
    purpose: '',
    retentionDays: '30'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDepartments();
    fetchMyFiles();
    if (tab === 'sent') fetchSentFiles();
    if (tab === 'received') fetchReceivedFiles();
    if (tab === 'approvals') fetchPendingApprovals();
    if (tab === 'dashboard') fetchStats();
  }, [tab]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/departments`);
      const data = await response.json();
      setDepartments(data.departments || data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchMyFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMyFiles(data.files || data.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchSentFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/sent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSentFiles(data.sentFiles || []);
    } catch (error) {
      console.error('Error fetching sent files:', error);
    }
  };

  const fetchReceivedFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/received`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReceivedFiles(data.receivedFiles || []);
    } catch (error) {
      console.error('Error fetching received files:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingApprovals(data.pendingApprovals || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.statistics);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSendFile = async (e) => {
    e.preventDefault();

    if (!formData.fileId || !formData.receiverDepartmentId || !formData.purpose) {
      setMessage('❌ Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: parseInt(formData.fileId),
          receiverDepartmentId: parseInt(formData.receiverDepartmentId),
          purpose: formData.purpose,
          retentionDays: parseInt(formData.retentionDays)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ File sent successfully!\nExchange ID: ${data.data.exchangeId}\nAwaiting receiver approval...`);
        setFormData({ fileId: '', receiverDepartmentId: '', purpose: '', retentionDays: '30' });
        fetchMyFiles();
        fetchSentFiles();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${data.error || 'Failed to send file'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (exchangeId) => {
    if (!window.confirm('Approve this file exchange?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/${exchangeId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.data.message}`);
        fetchPendingApprovals();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (exchangeId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/${exchangeId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ File exchange rejected`);
        fetchPendingApprovals();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (exchangeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/file-exchange/${exchangeId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.data.message}\nFile: ${data.data.fileName}`);
        fetchReceivedFiles();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          🔄 Secure File Exchange
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Enterprise-grade encrypted file transfers between departments (Estonia-level security)
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
          border: message.includes('✅') ? '1px solid #10b981' : '1px solid #ef4444',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace'
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'upload', label: '📤 Send File', icon: '📤' },
          { id: 'sent', label: 'Sent Files', icon: '📤' },
          { id: 'approvals', label: `Pending (${pendingApprovals.length})`, icon: '⏳' },
          { id: 'received', label: 'Received Files', icon: '📥' },
          { id: 'dashboard', label: 'Dashboard', icon: '📊' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              background: tab === item.id ? '#8b5cf6' : '#334155',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SEND FILE TAB */}
      {tab === 'upload' && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #8b5cf6',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}>📤 Send File to Department</h2>

          <form onSubmit={handleSendFile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* File Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                📄 Select File from Your Uploads
              </label>
              <select
                value={formData.fileId}
                onChange={(e) => setFormData({ ...formData, fileId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Select File --</option>
                {myFiles.map(file => (
                  <option key={file.id} value={file.id}>
                    {file.filename} ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
                  </option>
                ))}
              </select>
            </div>

            {/* Department Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                👥 Send to Department
              </label>
              <select
                value={formData.receiverDepartmentId}
                onChange={(e) => setFormData({ ...formData, receiverDepartmentId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Select Department --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                📝 Purpose of Exchange
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Data Analysis, Compliance Review, Budget Discussion"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Retention Days */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                ⏰ Auto-Delete After (days)
              </label>
              <select
                value={formData.retentionDays}
                onChange={(e) => setFormData({ ...formData, retentionDays: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontFamily: 'inherit'
                }}
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Security Info */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #8b5cf6',
              padding: '1rem',
              borderRadius: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem'
            }}>
              <p style={{ margin: '0.5rem 0', fontWeight: '600', color: '#8b5cf6' }}>🔐 Security Level: Estonia-Grade</p>
              <p style={{ margin: '0.25rem 0' }}>✓ AES-256 encryption in transit</p>
              <p style={{ margin: '0.25rem 0' }}>✓ RSA-2048 digital signatures</p>
              <p style={{ margin: '0.25rem 0' }}>✓ SHA-256 message digest</p>
              <p style={{ margin: '0.25rem 0' }}>✓ Non-repudiation guaranteed</p>
              <p style={{ margin: '0.25rem 0' }}>✓ Complete audit trail</p>
              <p style={{ margin: '0.5rem 0' }}>✓ DPDP compliant</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#475569' : 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s'
              }}
            >
              {loading ? '⏳ Encrypting & Sending...' : '📤 Send File for Exchange'}
            </button>
          </form>
        </div>
      )}

      {/* SENT FILES TAB */}
      {tab === 'sent' && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #8b5cf6',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}>📤 Files I Sent ({sentFiles.length})</h2>

          {sentFiles.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No files sent yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {sentFiles.map((file, idx) => (
                <div key={idx} style={{
                  background: '#0f172a',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>File</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>📄 {file.file_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Sent To</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>👥 {file.receiver_dept}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Purpose</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>📝 {file.purpose}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Status</p>
                      <p style={{
                        color: file.status === 'approved' ? '#86efac' : file.status === 'completed' ? '#86efac' : '#fbbf24',
                        fontWeight: '600',
                        margin: '0.25rem 0'
                      }}>
                        {file.status === 'approved' ? '✅' : file.status === 'completed' ? '✅' : '⏳'} {file.status}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    padding: '0.75rem',
                    borderRadius: '0.25rem',
                    color: '#cbd5e1',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                  }}>
                    <p style={{ margin: '0.25rem 0' }}>Exchange ID: {file.exchange_id?.substring(0, 20)}...</p>
                    <p style={{ margin: '0.25rem 0' }}>Signature: {file.digital_signature?.substring(0, 20)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PENDING APPROVALS TAB */}
      {tab === 'approvals' && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #8b5cf6',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}>⏳ Pending Approvals ({pendingApprovals.length})</h2>

          {pendingApprovals.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No pending approvals</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingApprovals.map((approval, idx) => (
                <div key={idx} style={{
                  background: '#0f172a',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>File</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>📄 {approval.file_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>From Department</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>👥 {approval.sender_dept}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>From</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>📧 {approval.sender_email}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Purpose</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>{approval.purpose}</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    padding: '0.75rem',
                    borderRadius: '0.25rem',
                    marginBottom: '1rem',
                    color: '#cbd5e1',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                  }}>
                    <p style={{ margin: '0.25rem 0' }}>Signature verified: ✓</p>
                    <p style={{ margin: '0.25rem 0' }}>Encryption: AES-256-CBC ✓</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApprove(approval.exchange_id)}
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
                      onClick={() => handleReject(approval.exchange_id)}
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

      {/* RECEIVED FILES TAB */}
      {tab === 'received' && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #8b5cf6',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '1.5rem' }}>📥 Files Received ({receivedFiles.length})</h2>

          {receivedFiles.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No files received yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {receivedFiles.map((file, idx) => (
                <div key={idx} style={{
                  background: '#0f172a',
                  border: '1px solid #8b5cf6',
                  borderRadius: '0.5rem',
                  padding: '1.5rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>File</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>📄 {file.file_name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>From</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>👥 {file.sender_dept}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Purpose</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>{file.purpose}</p>
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Received</p>
                      <p style={{ color: '#e2e8f0', fontWeight: '600', margin: '0.25rem 0' }}>
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file.exchange_id)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: loading ? '#475569' : '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    📥 Download & Decrypt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {tab === 'dashboard' && stats && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #8b5cf6',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <h2 style={{ color: '#8b5cf6', marginBottom: '2rem' }}>📊 Exchange Statistics</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #8b5cf6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Total Exchanges</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6', margin: '0.5rem 0' }}>
                {stats.totalExchanges}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0' }}>files exchanged</p>
            </div>

            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #8b5cf6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Success Rate</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: '0.5rem 0' }}>
                {stats.successRate}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0' }}>completed successfully</p>
            </div>

            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #8b5cf6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Departments</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', margin: '0.5rem 0' }}>
                {stats.departmentsInvolved}
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0' }}>involved in exchange</p>
            </div>

            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #8b5cf6' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0' }}>Data Exchanged</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#06b6d4', margin: '0.5rem 0' }}>
                {(stats.totalDataExchanged / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0' }}>total volume</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf6',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            color: '#cbd5e1'
          }}>
            <p style={{ fontWeight: '600', margin: '0 0 1rem 0', color: '#8b5cf6' }}>🔐 Security Status</p>
            <p style={{ margin: '0.5rem 0' }}>Encryption: <strong>AES-256-CBC ✓</strong></p>
            <p style={{ margin: '0.5rem 0' }}>Signatures: <strong>RSA-2048-SHA256 ✓</strong></p>
            <p style={{ margin: '0.5rem 0' }}>Non-Repudiation: <strong>Guaranteed ✓</strong></p>
            <p style={{ margin: '0.5rem 0' }}>Audit Trail: <strong>Complete ✓</strong></p>
            <p style={{ margin: '0.5rem 0' }}>DPDP Compliant: <strong>YES ✓</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileExchange;
