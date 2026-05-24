import React, { useState, useEffect } from 'react';

function Compliance() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  const getDefaultComplianceItems = () => [
    { id: 1, title: 'Data Inventory Mapping', category: 'Data Governance', completed: false, dueDate: '2026-06-30' },
    { id: 2, title: 'Privacy Impact Assessment', category: 'Assessment', completed: false, dueDate: '2026-06-30' },
    { id: 3, title: 'Consent Management System', category: 'Consent', completed: false, dueDate: '2026-07-15' },
    { id: 4, title: 'Data Subject Rights Portal', category: 'Rights', completed: false, dueDate: '2026-07-15' },
    { id: 5, title: 'Breach Notification Procedure', category: 'Security', completed: false, dueDate: '2026-06-15' },
    { id: 6, title: 'Data Processing Records', category: 'Documentation', completed: false, dueDate: '2026-07-01' },
    { id: 7, title: 'Third-party Audits', category: 'Audit', completed: false, dueDate: '2026-08-01' },
    { id: 8, title: 'Staff Training Program', category: 'Training', completed: false, dueDate: '2026-06-30' },
    { id: 9, title: 'Data Retention Policy', category: 'Policy', completed: false, dueDate: '2026-07-01' },
    { id: 10, title: 'Encryption Implementation', category: 'Security', completed: false, dueDate: '2026-06-30' },
    { id: 11, title: 'Access Control Matrix', category: 'Access', completed: false, dueDate: '2026-06-15' },
    { id: 12, title: 'Incident Response Plan', category: 'Response', completed: false, dueDate: '2026-06-30' },
    { id: 13, title: 'Data Processing Agreements', category: 'Contracts', completed: false, dueDate: '2026-07-15' },
    { id: 14, title: 'Cross-border Transfer Mechanism', category: 'Transfer', completed: false, dueDate: '2026-08-01' },
    { id: 15, title: 'Compliance Audit', category: 'Audit', completed: false, dueDate: '2026-08-15' },
  ];

  const fetchComplianceItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/compliance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let complianceItems = [];
      
      if (Array.isArray(data)) {
        complianceItems = data;
      } else if (data.items && Array.isArray(data.items)) {
        complianceItems = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        complianceItems = data.data;
      }

      // Default compliance items if none returned
      if (complianceItems.length === 0) {
        complianceItems = getDefaultComplianceItems();
      }

      setItems(complianceItems);
    } catch (error) {
      console.error('Error fetching compliance items:', error);
      // Set default items on error
      setItems(getDefaultComplianceItems());
    }
  };

  useEffect(() => {
    fetchComplianceItems();
  }, []);

  const toggleComplete = async (itemId) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      await fetch(`${API_URL}/api/compliance/${itemId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('✅ Item updated');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryCounts = {};
  items.forEach(item => {
    if (!categoryCounts[item.category]) {
      categoryCounts[item.category] = { total: 0, completed: 0 };
    }
    categoryCounts[item.category].total++;
    if (item.completed) {
      categoryCounts[item.category].completed++;
    }
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
          ✓ DPDP Compliance Checklist
        </h1>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Track your progress toward full DPDP compliance
        </p>
      </div>

      {/* Overall Progress */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Overall Progress</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {progressPercent}%
            </div>
            <div style={{ fontSize: '0.875rem' }}>Overall Completion</div>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '2px solid #10b981',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {completedCount}/{totalCount}
            </div>
            <div style={{ color: '#333', fontSize: '0.875rem' }}>Items Completed</div>
          </div>

          <div style={{
            background: '#dbeafe',
            border: '2px solid #06b6d4',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#06b6d4', marginBottom: '0.5rem' }}>
              {totalCount - completedCount}
            </div>
            <div style={{ color: '#333', fontSize: '0.875rem' }}>Remaining Items</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: '#e5e7eb',
          borderRadius: '0.5rem',
          height: '10px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            height: '100%',
            width: `${progressPercent}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
          {completedCount} of {totalCount} compliance items completed
        </p>
      </div>

      {/* Category Breakdown */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Compliance by Category</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {Object.entries(categoryCounts).map(([category, counts]) => {
            const categoryPercent = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
            return (
              <div key={category} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <strong style={{ color: '#333' }}>{category}</strong>
                  <span style={{
                    background: categoryPercent === 100 ? '#d1fae5' : '#fef3c7',
                    color: categoryPercent === 100 ? '#065f46' : '#92400e',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {counts.completed}/{counts.total}
                  </span>
                </div>
                <div style={{
                  background: '#e5e7eb',
                  borderRadius: '0.25rem',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: categoryPercent === 100 ? '#10b981' : '#f59e0b',
                    height: '100%',
                    width: `${categoryPercent}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Items List */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Compliance Items</h2>
        
        {message && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {message}
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: item.completed ? '#f0fdf4' : '#f9fafb',
              border: item.completed ? '1px solid #d1fae5' : '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleComplete(item.id)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{
                  color: item.completed ? '#999' : '#333',
                  fontWeight: '500',
                  textDecoration: item.completed ? 'line-through' : 'none'
                }}>
                  {item.title}
                </div>
                <div style={{
                  color: '#999',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem'
                }}>
                  {item.category} {item.dueDate && `• Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                </div>
              </div>

              <div style={{
                background: item.completed ? '#d1fae5' : '#fee2e2',
                color: item.completed ? '#065f46' : '#991b1b',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {item.completed ? '✓ Done' : '⏳ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Compliance;
