import React, { useState, useEffect } from 'react';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [piiResults, setPiiResults] = useState({});
  const [formData, setFormData] = useState({
    file: null
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/my-files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFiles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      alert('✅ File uploaded successfully!\nClick "Scan PII" to detect personal data.');
      setFormData({ file: null });
      setShowForm(false);
      fetchFiles();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleScanPII = async (fileId, filename) => {
    setScanning(fileId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${fileId}/scan-pii`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const data = await response.json();
      console.log('PII scan result:', data);
      
      setPiiResults((prev) => ({
        ...prev,
        [fileId]: data
      }));

      if (data.hasPII) {
        alert(`⚠️ PII DETECTED!\n\n${data.totalDetected} personal data elements found in ${filename}`);
      } else {
        alert(`✅ No PII detected in ${filename}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error scanning file: ' + error.message);
    } finally {
      setScanning(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          📁 Secure File Upload
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Upload files securely with automatic PII detection
        </p>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        {showForm ? '✕ Cancel' : '+ Upload File'}
      </button>

      {/* Upload Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'white',
            border: '2px solid #2563eb',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.5rem 0 0 0' }}>
                Any file type supported (Max 100MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading || !formData.file}
              style={{
                background: uploading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload File'}
            </button>
          </div>
        </form>
      )}

      {/* Files List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
          📂 My Files
        </h2>

        {files.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            color: '#999'
          }}>
            No files uploaded yet
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                    Filename
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                    Size
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                    Uploaded
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#111827' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => {
                  const piiData = piiResults[file.id];
                  return (
                    <React.Fragment key={index}>
                      <tr
                        style={{ borderBottom: '1px solid #f0f0f0' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                      >
                        <td style={{ padding: '1rem', color: '#111827' }}>
                          📄 {file.filename}
                        </td>
                        <td style={{ padding: '1rem', color: '#666' }}>
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleScanPII(file.id, file.filename)}
                            disabled={scanning === file.id}
                            style={{
                              background: scanning === file.id ? '#9ca3af' : '#ff6f00',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              cursor: scanning === file.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            {scanning === file.id ? '⏳ Scanning...' : '🔍 Scan PII'}
                          </button>
                          <button
                            onClick={() => alert('Share feature coming next!')}
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Share
                          </button>
                        </td>
                      </tr>
                      
                      {/* PII Results Row */}
                      {piiData && (
                        <tr style={{ background: piiData.hasPII ? '#fff3e0' : '#f0fdf4', borderBottom: '1px solid #ddd' }}>
                          <td colSpan="4" style={{ padding: '1rem' }}>
                            {piiData.hasPII ? (
                              <div>
                                <h4 style={{ color: '#e65100', margin: '0 0 0.75rem 0', fontWeight: '600' }}>
                                  ⚠️ PII DETECTED: {piiData.totalDetected} elements found
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                  {Object.entries(piiData.detections).map(([key, detection]) => (
                                    <div key={key} style={{
                                      background: 'white',
                                      padding: '0.75rem',
                                      borderRadius: '0.5rem',
                                      borderLeft: '4px solid #ff6f00'
                                    }}>
                                      <p style={{ fontWeight: '600', color: '#333', margin: '0 0 0.25rem 0' }}>
                                        {detection.label}
                                      </p>
                                      <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                                        Found: {detection.count}
                                      </p>
                                      {detection.samples && detection.samples.length > 0 && (
                                        <p style={{ fontSize: '0.75rem', color: '#999', margin: '0.25rem 0 0 0' }}>
                                          Sample: {detection.samples[0]}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div style={{ color: '#166534', fontWeight: '600' }}>
                                ✅ No PII detected
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;