import React, { useState, useEffect } from 'react';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    complianceScore: 85,
    breachCount: 2,
    tablesFound: 17,
  });
  const [loading, setLoading] = useState(false);

  // No need to fetch - use hardcoded demo data
  useEffect(() => {
    // Simulate loading
    setLoading(false);
  }, []);

  const StatCard = ({ icon, title, value, description, color }) => (
    <div style={{
      background: '#1e293b',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      borderLeft: `5px solid ${color}`,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    }}>
      <div style={{
        fontSize: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color + '20'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#e2e8f0' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: '600', marginBottom: '0.5rem' }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );

  const FeatureCard = ({ icon, title, description }) => (
    <div style={{
      background: '#1e293b',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981', margin: '0 0 0.75rem 0' }}>
        {icon} {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
        {description}
      </p>
    </div>
  );

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
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
      }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📊 DPDP Compliance Dashboard
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
          Digital Personal Data Protection Act Compliance Platform
        </p>
      </div>

      {/* Welcome Message */}
      <div style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        borderLeft: '4px solid #10b981',
        color: '#cbd5e1'
      }}>
        <p style={{ margin: 0 }}>
          Welcome, <strong>{user?.username || 'User'}</strong> ({user?.department || 'Department'})
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
          Your compliance journey with DPDP Act
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon="✓"
          title="Compliance Score"
          value={`${stats.complianceScore}%`}
          description="Overall compliance progress"
          color="#10b981"
        />
        <StatCard
          icon="📊"
          title="Tables Discovered"
          value={stats.tablesFound}
          description="Database records found"
          color="#3b82f6"
        />
        <StatCard
          icon="🚨"
          title="Breaches Reported"
          value={stats.breachCount}
          description="Incidents logged"
          color="#f59e0b"
        />
      </div>

      {/* Features */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '1rem' }}>
          🎯 Key Features
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <FeatureCard
            icon="📊"
            title="Data Discovery"
            description="Automatically scan your databases and identify all personal data locations. Detect PII patterns across tables."
          />
          <FeatureCard
            icon="✓"
            title="Compliance Checklist"
            description="Track 20 DPDP compliance items organized by category. Monitor progress toward full compliance."
          />
          <FeatureCard
            icon="🚨"
            title="Breach Alert"
            description="Report data breaches and auto-generate official DPB notification letters. Stay compliant with notification requirements."
          />
          <FeatureCard
            icon="📁"
            title="File Sharing"
            description="Securely share files between departments with approval workflows and audit trails."
          />
          <FeatureCard
            icon="🔄"
            title="File Exchange"
            description="Exchange files with encryption, digital signatures, and automatic retention policies."
          />
          <FeatureCard
            icon="📋"
            title="Audit Logs"
            description="Track all system activities and user actions with detailed audit trails for compliance."
          />
        </div>
      </div>

      {/* Getting Started */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          🚀 Get Started
        </h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
          Navigate using the sidebar menu to access each module:
        </p>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <li>📊 <strong>Data Discovery</strong> - Scan your databases</li>
          <li>✓ <strong>Compliance</strong> - Track compliance progress</li>
          <li>🚨 <strong>Breach Alert</strong> - Report incidents</li>
          <li>📁 <strong>File Sharing</strong> - Share files securely</li>
          <li>🔄 <strong>File Exchange</strong> - Exchange with encryption</li>
          <li>📋 <strong>Audit Logs</strong> - View system activities</li>
        </ul>
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#1e293b',
        borderRadius: '0.75rem',
        color: '#cbd5e1',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          Platform Status: <strong style={{ color: '#10b981' }}>✅ Operational</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
