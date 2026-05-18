import React, { useState, useEffect } from 'react';
import './Compliance.css';

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
      
      // Refresh data
      fetchChecklist();
      fetchScore();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading checklist...</p></div>;
  }

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container">
      <h1>✓ DPDP Compliance Checklist</h1>
      
      <div className="score-section">
        <div className="score-display">
          <div className="score-number">{score}%</div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${score}%` }}></div>
          </div>
          <p className="score-label">Overall Compliance Progress</p>
        </div>
      </div>

      <div className="categories">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category} className="category-section">
            <h2>{category}</h2>
            <div className="items-list">
              {categoryItems.map((item) => (
                <div key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id, item.completed)}
                    className="checkbox"
                  />
                  <div className="item-content">
                    <label className={item.completed ? 'completed' : ''}>
                      {item.title}
                    </label>
                  </div>
                  {item.completed && (
                    <span className="checkmark">✓</span>
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