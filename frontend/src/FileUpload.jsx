import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [retentionDays, setRetentionDays] = useState('30');

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

  React.useEffect(() => {
    fetchFiles();
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

      {/* HTTP Upload Form */}
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
                  Action
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
