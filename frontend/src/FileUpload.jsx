import React, { useState, useEffect } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [retentionDays, setRetentionDays] = useState(30);
  const [sftpCredentials, setSftpCredentials] = useState(null);
  const [showSftp, setShowSftp] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchSftpCredentials();
  }, []);

  const fetchSftpCredentials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sftp/credentials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSftpCredentials(data);
    } catch (error) {
      console.error('Error fetching SFTP credentials:', error);
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
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ File uploaded successfully!');
        setFile(null);
        
        // Set retention
        await fetch(`/api/retention/${data.fileId}/set-retention`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ retentionDays: parseInt(retentionDays) })
        });
        
        fetchFiles();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/my-files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Fetch retention info for each file
      const filesWithRetention = await Promise.all(
        data.map(async (file) => {
          const retRes = await fetch(`/api/retention/${file.id}/retention-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const retData = await retRes.json();
          return { ...file, retention: retData };
        })
      );
      
      setMyFiles(filesWithRetention);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure? This file will be permanently deleted.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/retention/${fileId}/delete-now`, {
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

  const downloadPdfReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports/compliance/pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compliance-report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('✅ PDF report downloaded');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    }
  };

  const getRetentionColor = (daysRemaining) => {
    if (!daysRemaining) return '#94a3b8';
    if (daysRemaining <= 3) return '#ef4444';
    if (daysRemaining <= 7) return '#f59e0b';
    return '#10b981';
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
          📁 Secure File Upload
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Upload with automatic PII detection & retention management
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
          onClick={() => setShowSftp(true)}
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
        <button
          onClick={downloadPdfReport}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s',
            marginLeft: 'auto'
          }}
        >
          📄 Download Report
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
                onChange={(e) => setFile(e.target.files[0])}
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

            <div>
              <label style={{ color: '#e2e8f0', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                ⏰ Retention Period (Auto-Delete)
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

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#475569' : 'linear-gradient(90deg, #10b981, #059669)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
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
            {sftpCredentials.instructions}
          </p>
        </div>
      )}

      {/* Files Table */}
      <div style={{
        background: '#1a1f3a',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: '1px solid #10b981'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>📂 My Files</h2>
        
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
                  Retention
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#10b981', fontWeight: '600' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {myFiles.map((file, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #334155', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ padding: '1rem', color: '#e2e8f0' }}>📄 {file.filename}</td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {file.retention && file.retention.days_remaining > 0 ? (
                      <span style={{
                        background: `${getRetentionColor(file.retention.days_remaining)}20`,
                        color: getRetentionColor(file.retention.days_remaining),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ⏰ {file.retention.days_remaining} days
                      </span>
                    ) : (
                      <span style={{
                        background: '#ef444420',
                        color: '#fca5a5',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ⚠️ Expired
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
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
