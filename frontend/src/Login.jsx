import React, { useState } from 'react';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@dpdp.gov.in');
  const [password, setPassword] = useState('password123');
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username, email, password, department, role: 'user' }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error occurred');
        return;
      }

      if (isRegister) {
        setError('');
        setIsRegister(false);
        setEmail('');
        setPassword('');
        alert('Registration successful! Please login.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (error) {
      setError('Connection error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>📊</h1>
        <h2>DPDP</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Governance Platform
        </p>

        <div className="tab-toggle">
          <button
            onClick={() => setIsRegister(false)}
            className={`tab-button ${!isRegister ? 'active' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`tab-button ${isRegister ? 'active' : ''}`}
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="john_doe"
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="IT"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Processing...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {!isRegister && (
          <div className="demo-users">
            <p>Demo Users:</p>
            <small>
              👤 admin@dpdp.gov.in (Admin)<br />
              👤 manager@dpdp.gov.in (Manager)<br />
              👤 officer@dpdp.gov.in (Officer)<br />
              <strong style={{ marginTop: '0.5rem', display: 'block' }}>
                Password: password123
              </strong>
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;