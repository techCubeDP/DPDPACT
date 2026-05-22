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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ color: '#666' }}>Loading...</p>
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
  { id: 'sharing', label: 'File Sharing', icon: '🔄' },  // ADD THIS
];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? '16rem' : '5rem',
        background: 'linear-gradient(to bottom, #1e3a8a, #1e40af)',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.875rem' }}>📊</div>
            {sidebarOpen && <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>DPDP</div>}
          </div>
          {sidebarOpen && <p style={{ fontSize: '0.75rem', color: '#bfdbfe', marginTop: '0.5rem' }}>Governance Platform</p>}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activePage === item.id ? '#2563eb' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontWeight: activePage === item.id ? '500' : 'normal'
              }}
              onMouseEnter={(e) => !activePage === item.id && (e.target.style.background = '#1e40af')}
              onMouseLeave={(e) => activePage !== item.id && (e.target.style.background = 'transparent')}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #1e40af',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{
            background: '#1e40af',
            borderRadius: '0.5rem',
            padding: '0.75rem'
          }}>
            {sidebarOpen && (
              <>
                <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.username}</p>
                <p style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>{user.department}</p>
                <p style={{
                  fontSize: '0.75rem',
                  background: '#2563eb',
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  marginTop: '0.5rem',
                  fontWeight: '600'
                }}>
                  {user.role.toUpperCase()}
                </p>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#dc2626',
              color: 'white',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => (e.target.style.background = '#b91c1c')}
            onMouseLeave={(e) => (e.target.style.background = '#dc2626')}
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '100%',
              background: '#1e40af',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {sidebarOpen ? '◄' : '►'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TOP BAR */}
        <div style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {navItems.find(item => item.id === activePage)?.label}
          </h1>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '2rem' }}>
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