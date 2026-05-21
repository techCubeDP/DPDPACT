import React, { useState, useEffect } from 'react';

function BreachAlert() {
  const [breaches, setBreaches] = useState([]);
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: 'medium',
    description: '',
    affectedRecords: '',
  });

  useEffect(() => {
    fetchBreaches();
  }, []);

  const fetchBreaches = async () => {
    try {
      const response = await fetch('/api/breaches');
      const data = await response.json();
      setBreaches(data);
    } catch (error) {
      console.error('Error fetching breaches:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createResponse = await fetch('/api/breaches/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          affectedRecords: parseInt(formData.affectedRecords),
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create breach');
      }

      const breach = await createResponse.json();

      const letterResponse = await fetch(`/api/breaches/${breach.id}/generate-letter`, {
        method: 'POST',
      });

      if (!letterResponse.ok) {
        throw new Error('Failed to generate letter');
      }

      const letterData = await letterResponse.json();
      setGeneratedLetter(letterData.letter);

      setFormData({
        title: '',
        severity: 'medium',
        description: '',
        affectedRecords: '',
      });

      fetchBreaches();
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    alert('Letter copied to clipboard!');
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedLetter));
    element.setAttribute('download', 'DPB_Breach_Notification.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a'
    };
    return colors[severity] || '#666';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          🚨 Breach Alert & DPB Notification
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Report breaches and auto-generate notification letters
        </p>
      </div>

      {/* Report Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          background: '#dc2626',
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
        {showForm ? '✕ Cancel' : '+ Report New Breach'}
      </button>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff3e0',
            border: '2px solid #ff6f00',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Breach Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Unauthorized Data Export"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Severity
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleFormChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe what happened..."
                rows="4"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                Affected Records
              </label>
              <input
                type="number"
                name="affectedRecords"
                value={formData.affectedRecords}
                onChange={handleFormChange}
                placeholder="e.g., 1500"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#ff6f00',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Generating...' : '📝 Report & Generate Letter'}
            </button>
          </div>
        </form>
      )}

      {/* Letter */}
      {generatedLetter && (
        <div
          style={{
            background: '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1b5e20', marginTop: 0 }}>
            📄 Generated DPB Notification Letter
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={copyToClipboard}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📋 Copy
            </button>
            <button
              onClick={downloadLetter}
              style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ⬇️ Download
            </button>
          </div>

          <pre
            style={{
              background: 'white',
              border: '1px solid #c8e6c9',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '0.75rem',
              lineHeight: '1.6',
              color: '#333'
            }}
          >
            {generatedLetter}
          </pre>
        </div>
      )}

      {/* Breach History */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
          📋 Breach History
        </h2>

        {breaches.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            color: '#999'
          }}>
            No breaches reported yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {breaches.map((breach) => (
              <div
                key={breach.id}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  borderLeft: `5px solid ${getSeverityColor(breach.severity)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {breach.title}
                  </h3>
                  <span
                    style={{
                      background: getSeverityColor(breach.severity),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    {breach.severity.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Date:</strong> {new Date(breach.detected_at).toLocaleDateString('en-IN')}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Affected:</strong> {breach.affected_records} records
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong> {breach.status}
                  </p>
                  <p style={{ margin: '0.75rem 0 0 0', color: '#555', lineHeight: '1.5' }}>
                    {breach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BreachAlert;