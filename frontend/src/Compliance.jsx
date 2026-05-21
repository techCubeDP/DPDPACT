import React, { useState, useEffect } from 'react';

function Compliance() {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecklist();
    fetchScore();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await fetch('/api/compliance/checklist');
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checklist:', error);
      setLoading(false);
    }
  };

  const fetchScore = async () => {
    try {
      const response = await fetch('/api/compliance/score');
      const data = await response.json();
      setScore(data.score);
    } catch (error) {
      console.error('Error fetching score:', error);
    }
  };

  const toggleComplete = async (id, currentState) => {
    try {
      await fetch(`/api/compliance/checklist/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentState }),
      });
      fetchChecklist();
      fetchScore();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0' }}>
          ✓ DPDP Compliance Checklist
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Track your progress toward full DPDP compliance
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
            Overall Progress
          </h2>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {score}%
          </span>
        </div>
        <div style={{
          background: '#e5e7eb',
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #4caf50, #81c784)',
            height: '100%',
            width: `${score}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div
            key={category}
            style={{
              background: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', margin: 0 }}>
              {category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #f0f0f0',
                    gap: '0.75rem'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id, item.completed)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#2563eb'
                    }}
                  />
                  <label
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      color: item.completed ? '#999' : '#333',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    {item.title}
                  </label>
                  {item.completed && (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Compliance;