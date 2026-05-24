import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [myFiles, setMyFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [retentionDays, setRetentionDays] = useState('30');
  const [piiScanResults, setPiiScanResults] = useState(null);

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

      {/* Upload Form */}
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
                  {data.samples.length > 0 && (
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      fontFamily: 'monospace',
                      maxHeight: '60px',
                      overflow: 'auto'
                    }}>
                      {data.samples.map((sample, idx) => (
                        <div key={idx} style={{ wordBreak: 'break-all' }}>
                          {sample.substring(0, 30)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p style={{
            color: '#cbd5e1',
            fontSize: '0.875rem',
            margin: '1rem 0 0 0',
            lineHeight: '1.6'
          }}>
            {piiScanResults.hasPII
              ? '⚠️ This file contains personal data. Ensure proper data protection measures are in place before sharing.'
              : '✅ Safe to share. No sensitive personal information detected.'}
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
