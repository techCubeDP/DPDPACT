import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [retentionDays, setRetentionDays] = useState('30');
  const [piiScanResults, setPiiScanResults] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [shareModal, setShareModal] = useState(null);
  const [sftpCredentials, setSftpCredentials] = useState(null);
  const [showSftp, setShowSftp] = useState(false);
  const [shareFormData, setShareFormData] = useState({
    receiverDepartmentId: '',
    purpose: ''
  });

  const detectPII = (content) => {
    const piiPatterns = {
      email: { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: '📧 Email' },
      phone: { regex: /(\+91[-.\s]?)?([0-9]{10}|\([0-9]{3}\)[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g, label: '☎️ Phone' },
      aadhar: { regex: /\b([0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4})\b/g, label: '🔐 Aadhar' },
      pan: { regex: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g, label: '💳 PAN' },
      ssn: { regex: /\b([0-9]{3}-[0-9]{2}-[0-9]{4})\b/g, label: '🔢 SSN' },
      creditCard: { regex: /\b([0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4})\b/g, label: '💳 Credit Card' },
      password: { regex: /password\s*[:=]\s*[^\s]+/gi, label: '🔒 Password' },
      ipAddress: { regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, label: '🌐 IP Address' }
    };

    const findings = {};
    let totalMatches = 0;

    for (const [key, { regex, label }] of Object.entries(piiPatterns)) {
      const matches = content.match(regex);
      if (matches) {
        findings[key] = {
          label,
          count: matches.length,
          samples: matches.slice(0, 3)
        };
        totalMatches += matches.length;
      }
    }

    return {
      hasPII: totalMatches > 0,
      totalMatches,
      findings
    };
  };

  const handleScanPII = async () => {
    if (!file) {
      setMessage('❌ Please select a file');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const results = detectPII(content);
        setPiiScanResults(results);
        
        if (results.hasPII) {
          setMessage(`⚠️ Found ${results.totalMatches} PII indicators in the file!`);
        } else {
          setMessage('✅ No PII detected in this file');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setMessage('❌ Error scanning file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('❌ Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('retentionDays', retentionDays);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
        setFile(null);
        setPiiScanResults(null);
        fetchFiles();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (data.error || 'Upload failed'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setMyFiles(data.files || data.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setMyFiles([]);
    }
  };

  const fetchSftpCredentials = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/sftp/credentials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSftpCredentials(data.data || data);
    } catch (error) {
      console.error('Error fetching SFTP credentials:', error);
      setSftpCredentials({
        host: 'sftp.dpdp-compliance.gov.in',
        port: 22,
        username: 'dpdp_user',
        instructions: 'Use your login credentials to connect via SFTP. All files are automatically scanned for PII and subject to retention policies.'
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/departments`);
      const data = await response.json();
      setDepartments(data.departments || data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleShareFile = (fileId) => {
    setShareModal(fileId);
    setShareFormData({ receiverDepartmentId: '', purpose: '' });
    fetchDepartments();
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    
    if (!shareFormData.receiverDepartmentId || !shareFormData.purpose) {
      setMessage('❌ Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/file-sharing/${shareModal}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverDepartmentId: parseInt(shareFormData.receiverDepartmentId),
          purpose: shareFormData.purpose
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ File shared successfully! Waiting for approval...');
        setShareModal(null);
        setShareFormData({ receiverDepartmentId: '', purpose: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to share: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFiles();
    fetchSftpCredentials();
  }, []);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure? This file will be permanently deleted.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ File deleted successfully');
        fetchFiles();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📁 Secure File Upload & Sharing
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Upload via HTTP or SFTP with automatic PII detection & secure sharing
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
          onClick={() => setShowSftp(false)}
          style={{
            background: !showSftp ? '#10b981' : '#334155',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          📤 HTTP Upload
        </button>
        <button
          onClick={() => { setShowSftp(true); fetchSftpCredentials(); }}
          style={{
            background: showSftp ? '#10b981' : '#334155',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          🔐 SFTP Upload
        </button>
      </div>

      {/* HTTP Upload Form */}
      {!showSftp && (
        <div style={{
          background: '#1a1f3a',
          border: '2px dashed #10b981',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ color: '#e2e8f0', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                📄 Select File
              </label>
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setPiiScanResults(null);
                }}
                style={{
                  background: '#0f172a',
                  border: '1px solid #10b981',
                  color: '#e2e8f0',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>

            {file && (
              <div style={{
                background: '#0f172a',
                border: '1px solid #06b6d4',
                padding: '1rem',
                borderRadius: '0.5rem',
                color: '#cbd5e1'
              }}>
                📋 Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleScanPII}
                disabled={!file || loading}
                style={{
                  flex: 1,
                  background: loading ? '#475569' : '#06b6d4',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading || !file ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                }}
              >
                {loading ? '⏳ Scanning...' : '🔍 Scan for PII'}
              </button>

              <div style={{ flex: 1 }}>
                <label style={{ color: '#e2e8f0', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                  ⏰ Retention Period
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #10b981',
                    color: '#e2e8f0',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              style={{
                background: loading || !file ? '#475569' : 'linear-gradient(90deg, #10b981, #059669)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading || !file ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s'
              }}
            >
              {loading ? '⏳ Uploading...' : '+ Upload File'}
            </button>
          </form>
        </div>
      )}

      {/* SFTP Info */}
      {showSftp && sftpCredentials && (
        <div style={{
          background: '#1a1f3a',
          border: '2px solid #3b82f6',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#3b82f6', marginBottom: '1rem' }}>🔐 SFTP Upload Instructions</h2>
          <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <p style={{ color: '#e2e8f0', margin: '0.5rem 0', fontFamily: 'monospace' }}>
              <strong>Host:</strong> {sftpCredentials.host}
            </p>
            <p style={{ color: '#e2e8f0', margin: '0.5rem 0', fontFamily: 'monospace' }}>
              <strong>Port:</strong> {sftpCredentials.port}
            </p>
            <p style={{ color: '#e2e8f0', margin: '0.5rem 0', fontFamily: 'monospace' }}>
              <strong>Username:</strong> {sftpCredentials.username}
            </p>
            <p style={{ color: '#e2e8f0', margin: '0.5rem 0', fontFamily: 'monospace' }}>
              <strong>Password:</strong> Your login password
            </p>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
            {sftpCredentials.instructions || 'Connect using any SFTP client (FileZilla, WinSCP, Terminal) with your credentials above. All uploaded files are automatically scanned for PII and subject to retention policies.'}
          </p>
        </div>
      )}

      {/* PII Scan Results */}
      {piiScanResults && (
        <div style={{
          background: piiScanResults.hasPII ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: piiScanResults.hasPII ? '2px solid #ef4444' : '2px solid #10b981',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: piiScanResults.hasPII ? '#fca5a5' : '#86efac',
            marginTop: 0,
            fontSize: '1.1rem'
          }}>
            {piiScanResults.hasPII ? '⚠️ PII DETECTED' : '✅ No PII Found'}
          </h3>

          {piiScanResults.hasPII && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              {Object.entries(piiScanResults.findings).map(([key, data]) => (
                <div key={key} style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ color: '#fca5a5', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {data.label}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Found: <strong>{data.count}</strong> match(es)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0f172a',
            border: '2px solid #06b6d4',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#e2e8f0' }}>
              📤 Share File with Department
            </h2>

            <form onSubmit={handleShareSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                  Select Department
                </label>
                <select
                  value={shareFormData.receiverDepartmentId}
                  onChange={(e) => setShareFormData({
                    ...shareFormData,
                    receiverDepartmentId: e.target.value
                  })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #06b6d4',
                    borderRadius: '0.5rem',
                    fontFamily: 'inherit',
                    background: '#1a1f3a',
                    color: '#e2e8f0'
                  }}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#cbd5e1' }}>
                  Purpose of Share
                </label>
                <textarea
                  value={shareFormData.purpose}
                  onChange={(e) => setShareFormData({
                    ...shareFormData,
                    purpose: e.target.value
                  })}
                  placeholder="e.g., Data Analysis, Audit, Compliance Check"
                  rows="3"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #06b6d4',
                    borderRadius: '0.5rem',
                    fontFamily: 'inherit',
                    background: '#1a1f3a',
                    color: '#e2e8f0',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShareModal(null);
                    setShareFormData({ receiverDepartmentId: '', purpose: '' });
                  }}
                  style={{
                    flex: 1,
                    background: '#334155',
                    color: '#e2e8f0',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
                  {loading ? '⏳ Sharing...' : '📤 Share File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files Table */}
      <div style={{
        background: '#1a1f3a',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: '1px solid #10b981'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>📂 My Files ({myFiles.length})</h2>
        
        {myFiles.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>No files uploaded yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #10b981' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10b981', fontWeight: '600' }}>
                  Filename
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10b981', fontWeight: '600' }}>
                  Size
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10b981', fontWeight: '600' }}>
                  Uploaded
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10b981', fontWeight: '600' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {myFiles.map((file, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ padding: '1rem', color: '#e2e8f0' }}>📄 {file.filename}</td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {(file.file_size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleShareFile(file.id)}
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      📤 Share
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
