import React, { useState, useEffect } from 'react';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs');
      const data = await response.json();

      console.log('📋 Audit logs fetched:', data);

      setLogs(data.logs || data.data || []);
    } catch (error) {
      console.error('❌ Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'DATABASE_SCAN': '📊',
      'COMPLIANCE_ITEM_COMPLETED': '✅',
      'FILE_UPLOADED': '📤',
      'FILE_SHARED': '🔄',
      'FILE_APPROVED': '✓',
      'FILE_REJECTED': '✗',
      'BREACH_REPORTED': '🚨',
      'DATA_DISCOVERED': '🔍',
      'USER_LOGIN': '🔐',
      'USER_LOGOUT': '🚪',
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action) => {
    const colors = {
      'DATABASE_SCAN': '#3b82f6',
      'COMPLIANCE_ITEM_COMPLETED': '#10b981',
      'FILE_UPLOADED': '#8b5cf6',
      'FILE_SHARED': '#f59e0b',
      'FILE_APPROVED': '#06b6d4',
      'FILE_REJECTED': '#ef4444',
      'BREACH_REPORTED': '#f43f5e',
      'DATA_DISCOVERED': '#6366f1',
    };
    return colors[action] || '#64748b';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action === filter);

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          📋 Audit Logs
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Track all system activities and user actions
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#1e293b',
          padding: '1rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          borderLeft: '4px solid #6366f1'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6366f1' }}>
            {logs.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Total Events
          </div>
        </div>
        <div style={{
          background: '#1e293b',
          padding: '1rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {uniqueActions.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Action Types
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ color: '#cbd5e1', marginRight: '1rem' }}>Filter by Action:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #6366f1',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Actions</option>
          {uniqueActions.map(action => (
            <option key={action} value={action}>
              {formatAction(action)}
            </option>
          ))}
        </select>
      </div>

      {/* Logs List */}
      <div style={{
        background: '#0f172a',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            No audit logs found
          </div>
        ) : (
          <div>
            {filteredLogs.map((log, index) => (
              <div
                key={log.id || index}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < filteredLogs.length - 1 ? '1px solid #1e293b' : 'none',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '0.75rem',
                  background: getActionColor(log.action) + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#e2e8f0',
                    marginBottom: '0.25rem'
                  }}>
                    {formatAction(log.action)}
                  </div>
                  
                  {/* Details from JSON */}
                  {log.details && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#cbd5e1',
                      marginBottom: '0.5rem'
                    }}>
                      {typeof log.details === 'string' 
                        ? log.details 
                        : Object.entries(log.details)
                            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                            .join(' | ')}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <span>🕐 {formatDate(log.created_at)}</span>
                    {log.file_id && <span>📄 File #{log.file_id}</span>}
                  </div>
                </div>

                {/* User Badge */}
                <div style={{
                  background: '#1e293b',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap'
                }}>
                  User #{log.user_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#1e293b',
        borderRadius: '0.75rem',
        color: '#cbd5e1',
        fontSize: '0.875rem'
      }}>
        <strong>Showing {filteredLogs.length} of {logs.length} events</strong>
        <br />
        Last activity: {logs.length > 0 ? formatDate(logs[0].created_at) : 'None'}
      </div>
    </div>
  );
}

export default AuditLogs;
