import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';
import DataDiscovery from './DataDiscovery';
import Compliance from './Compliance';
import BreachAlert from './BreachAlert';
import FileUpload from './FileUpload';
import FileSharing from './FileSharing';
import AuditLogs from './AuditLogs';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a0033 100%)',
        color: '#e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>📊</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'discovery', label: 'Data Discovery', icon: '📊' },
    { id: 'compliance', label: 'Compliance', icon: '✓' },
    { id: 'breach', label: 'Breach Alert', icon: '🚨' },
    { id: 'upload', label: 'File Upload', icon: '📁' },
    { id: 'sharing', label: 'File Sharing', icon: '🔄' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
  ];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">📊 DPDP</div>
          <p className="app-name">Governance Platform</p>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div>
            <p className="user-name">{user.username}</p>
            <p className="user-role">{user.department}</p>
          </div>

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOP BAR */}
        <div>
          <h1>{navItems.find(item => item.id === activePage)?.label}</h1>
        </div>

        {/* PAGE CONTENT */}
        <div>
          <div>
            {activePage === 'dashboard' && <Dashboard user={user} />}
            {activePage === 'discovery' && <DataDiscovery />}
            {activePage === 'compliance' && <Compliance />}
            {activePage === 'breach' && <BreachAlert />}
            {activePage === 'upload' && <FileUpload />}
            {activePage === 'sharing' && <FileSharing />}
            {activePage === 'audit' && <AuditLogs />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
