import React, { useState } from 'react';
import './App.css';
import DataDiscovery from './DataDiscovery';
import Compliance from './Compliance';
import BreachAlert from './BreachAlert';

function App() {
  const [activePage, setActivePage] = useState('discovery');

  return (
    <div className="app">
      <div className="sidebar">
        <h1 className="logo">📊 DPDP</h1>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activePage === 'discovery' ? 'active' : ''}`}
            onClick={() => setActivePage('discovery')}
          >
            📊 Data Discovery
          </button>
          <button
            className={`nav-item ${activePage === 'compliance' ? 'active' : ''}`}
            onClick={() => setActivePage('compliance')}
          >
            ✓ Compliance
          </button>
          <button
            className={`nav-item ${activePage === 'breach' ? 'active' : ''}`}
            onClick={() => setActivePage('breach')}
          >
            🚨 Breach Alert
          </button>
        </nav>
      </div>

      <div className="main-content">
        {activePage === 'discovery' && <DataDiscovery />}
        {activePage === 'compliance' && <Compliance />}
        {activePage === 'breach' && <BreachAlert />}
      </div>
    </div>
  );
}

export default App;