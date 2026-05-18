import React, { useState, useEffect } from 'react';
import './BreachAlert.css';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create breach
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

      // Generate letter
      const letterResponse = await fetch(`/api/breaches/${breach.id}/generate-letter`, {
        method: 'POST',
      });

      if (!letterResponse.ok) {
        throw new Error('Failed to generate letter');
      }

      const letterData = await letterResponse.json();
      setGeneratedLetter(letterData.letter);

      // Reset form
      setFormData({
        title: '',
        severity: 'medium',
        description: '',
        affectedRecords: '',
      });

      // Refresh breaches list
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
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      default:
        return '#388e3c';
    }
  };

  return (
    <div className="container">
      <h1>🚨 Breach Alert & DPB Notification</h1>

      <button 
        className="report-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? '✕ Cancel' : '+ Report New Breach'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="breach-form">
          <div className="form-group">
            <label>Breach Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="e.g., Unauthorized Data Export"
              required
            />
          </div>

          <div className="form-group">
            <label>Severity Level *</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleFormChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe what happened..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Affected Records *</label>
            <input
              type="number"
              name="affectedRecords"
              value={formData.affectedRecords}
              onChange={handleFormChange}
              placeholder="e.g., 1500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="submit-btn"
          >
            {loading ? '⏳ Generating...' : '📝 Report & Generate Letter'}
          </button>
        </form>
      )}

      {generatedLetter && (
        <div className="letter-section">
          <h2>📄 Generated DPB Notification Letter</h2>
          <div className="letter-actions">
            <button onClick={copyToClipboard} className="action-btn copy-btn">
              📋 Copy to Clipboard
            </button>
            <button onClick={downloadLetter} className="action-btn download-btn">
              ⬇️ Download as Text
            </button>
          </div>
          <pre className="letter-content">{generatedLetter}</pre>
          <p className="letter-note">
            ⚠️ Note: Add your organization's official letterhead, seal, and DPO's 
            digital signature before submitting to Data Protection Board.
          </p>
        </div>
      )}

      <div className="breaches-section">
        <h2>📋 Breach History</h2>
        {breaches.length === 0 ? (
          <p className="no-breaches">No breaches reported yet.</p>
        ) : (
          <div className="breaches-list">
            {breaches.map((breach) => (
              <div key={breach.id} className="breach-card">
                <div className="breach-header">
                  <h3>{breach.title}</h3>
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(breach.severity) }}
                  >
                    {breach.severity.toUpperCase()}
                  </span>
                </div>
                <div className="breach-details">
                  <p>
                    <strong>Date:</strong> {new Date(breach.detected_at).toLocaleDateString('en-IN')}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className="status-badge">{breach.status.toUpperCase()}</span>
                  </p>
                  <p>
                    <strong>Affected Records:</strong> {breach.affected_records}
                  </p>
                  <p className="description">{breach.description}</p>
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