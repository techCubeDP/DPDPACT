import React, { useState, useEffect } from 'react';

function AdvancedDiscovery() {
  const [dataSources, setDataSources] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [customDbForm, setCustomDbForm] = useState({
    type: 'mysql',
    host: '',
    port: '3306',
    username: '',
    password: '',
    database: ''
  });
  const [showCustomDb, setShowCustomDb] = useState(false);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/advanced-discovery/data-sources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDataSources(data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const scanAllSources = async () => {
    setLoading(true);
    setMessage('🔍 Scanning all data sources...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/advanced-discovery/scan-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setScanResults(data);
      setMessage('✅ Scan complete!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const scanCustomDatabase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(`🔍 Scanning ${customDbForm.type} database...`);

    try {
      const token = localStorage.getItem('token');
      const endpoint = customDbForm.type === 'mysql' 
        ? '/api/advanced-discovery/scan-mysql'
        : '/api/advanced-discovery/scan-postgresql';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customDbForm)
      });

      const data = await response.json();
      
      if (data.status === 'failed') {
        setMessage('❌ ' + data.error);
      } else {
        setMessage('✅ Database scanned successfully!');
        setCustomDbForm({
          type: 'mysql',
          host: '',
          port: '3306',
          username: '',
          password: '',
          database: ''
        });
        setShowCustomDb(false);
        scanAllSources();
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          🗄️ Advanced Data Discovery
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Scan all databases, S3 buckets, and cloud storage for PII
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          color: message.includes('✅') ? '#4caf50' : '#f44336',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: message.includes('✅') ? '1px solid #4caf50' : '1px solid #f44336'
        }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: activeTab === 'overview' ? '#667eea' : 'transparent',
            color: activeTab === 'overview' ? 'white' : '#333',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('databases')}
          style={{
            background: activeTab === 'databases' ? '#667eea' : 'transparent',
            color: activeTab === 'databases' ? 'white' : '#333',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          🗄️ Databases
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          style={{
            background: activeTab === 'storage' ? '#667eea' : 'transparent',
            color: activeTab === 'storage' ? 'white' : '#333',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          ☁️ Cloud Storage
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={scanAllSources}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(90deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              {loading ? '⏳ Scanning...' : '🔍 Scan All Sources'}
            </button>

            <button
              onClick={() => setShowCustomDb(!showCustomDb)}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
            >
              {showCustomDb ? '✕ Close' : '+ Add Database'}
            </button>
          </div>

          {/* Custom Database Form */}
          {showCustomDb && (
            <div style={{
              background: 'white',
              border: '2px solid #2196f3',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginTop: 0 }}>
                Add External Database
              </h2>
              <form onSubmit={scanCustomDatabase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Database Type
                    </label>
                    <select
                      value={customDbForm.type}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    >
                      <option value="mysql">MySQL</option>
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mongodb">MongoDB</option>
                      <option value="oracle">Oracle</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Host
                    </label>
                    <input
                      type="text"
                      value={customDbForm.host}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, host: e.target.value })}
                      placeholder="localhost"
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Port
                    </label>
                    <input
                      type="number"
                      value={customDbForm.port}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, port: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={customDbForm.username}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, username: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={customDbForm.password}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                      Database Name
                    </label>
                    <input
                      type="text"
                      value={customDbForm.database}
                      onChange={(e) => setCustomDbForm({ ...customDbForm, database: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '⏳ Connecting...' : '🔗 Connect & Scan'}
                </button>
              </form>
            </div>
          )}

          {/* Data Sources Overview */}
          {dataSources && (
            <div style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginTop: 0 }}>
                📋 Available Data Sources
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Databases */}
                {dataSources.databases && dataSources.databases.map((db, idx) => (
                  <div key={idx} style={{
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.75rem',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: '#333', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                      🗄️ {db.name}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                      <strong>Type:</strong> {db.type}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                      <strong>Status:</strong> <span style={{ color: db.status === 'connected' ? '#4caf50' : '#f44336' }}>
                        {db.status.toUpperCase()}
                      </span>
                    </p>
                    {db.lastScanned && (
                      <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>
                        Last scanned: {new Date(db.lastScanned).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}

                {/* S3 Buckets */}
                {dataSources.s3Buckets && dataSources.s3Buckets.map((bucket, idx) => (
                  <div key={idx} style={{
                    background: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.75rem',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: '#333', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                      🪣 {bucket.name}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                      <strong>Bucket:</strong> {bucket.bucket}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                      <strong>Status:</strong> <span style={{ color: bucket.status === 'configured' ? '#4caf50' : '#ff9800' }}>
                        {bucket.status.toUpperCase()}
                      </span>
                    </p>
                    {!bucket.lastScanned && (
                      <p style={{ color: '#999', fontSize: '0.75rem', margin: 0 }}>
                        Not yet scanned
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Coming Soon */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
                <h3 style={{ color: '#333', marginTop: 0 }}>🚀 Coming Soon</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {dataSources.external && dataSources.external.map((ext, idx) => (
                    <div key={idx} style={{
                      background: '#f5f5f5',
                      border: '1px dashed #ccc',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{ext.icon}</div>
                      <h4 style={{ color: '#666', margin: '0 0 0.25rem 0' }}>{ext.name}</h4>
                      <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
                        {ext.type}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Databases Tab */}
      {activeTab === 'databases' && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginTop: 0 }}>
            🗄️ Database Scan Results
          </h2>
          {scanResults && scanResults.sources.some(s => s.type === 'PostgreSQL' || s.type === 'MySQL') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scanResults.sources.map((source, idx) => (
                (source.type === 'PostgreSQL' || source.type === 'MySQL') && (
                  <div key={idx} style={{
                    background: source.status === 'scanned' ? '#f0f7ff' : '#fff3e0',
                    border: source.status === 'scanned' ? '1px solid #2196f3' : '1px solid #ff9800',
                    borderRadius: '0.75rem',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: '#333', margin: 0 }}>{source.name}</h3>
                    <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                      Status: <strong>{source.status}</strong> | Tables: <strong>{source.itemCount}</strong>
                    </p>
                    {source.error && (
                      <p style={{ color: '#f44336', margin: '0.5rem 0 0 0' }}>
                        Error: {source.error}
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No database scan results yet. Click "Scan All Sources" to begin.</p>
          )}
        </div>
      )}

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333', marginTop: 0 }}>
            ☁️ Cloud Storage Scan Results
          </h2>
          {scanResults && scanResults.sources.some(s => s.type === 'S3') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scanResults.sources.map((source, idx) => (
                source.type === 'S3' && (
                  <div key={idx} style={{
                    background: source.status === 'scanned' ? '#f0f7ff' : '#fff3e0',
                    border: source.status === 'scanned' ? '1px solid #2196f3' : '1px solid #ff9800',
                    borderRadius: '0.75rem',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: '#333', margin: 0 }}>{source.name}</h3>
                    <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                      Status: <strong>{source.status}</strong> | Objects: <strong>{source.itemCount}</strong>
                    </p>
                    {source.error && (
                      <p style={{ color: '#f44336', margin: '0.5rem 0 0 0' }}>
                        Error: {source.error}
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No S3 scan results yet. Click "Scan All Sources" to begin.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedDiscovery;
