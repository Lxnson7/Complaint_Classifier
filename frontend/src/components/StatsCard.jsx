import React from 'react';

const categoryColors = {
  'Payment Issue': '#f59e0b',
  'Delivery Issue': '#3b82f6',
  'Product Defect': '#ef4444',
  'Refund Request': '#10b981',
  'Account Problem': '#8b5cf6',
  'Fraud': '#dc2626',
  'General Query': '#6b7280'
};

const StatsCard = ({ stats }) => {
  const { category_breakdown = {}, category_percentages = {}, total_complaints = 0 } = stats;

  return (
    <div className="card">
      <h2 className="card-title">📈 Statistics</h2>
      
      {total_complaints === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>No complaints yet. Submit one to see statistics!</p>
        </div>
      ) : (
        <div className="stats-grid">
          {Object.entries(category_breakdown).map(([category, count]) => {
            const percentage = category_percentages[category] || 0;
            const color = categoryColors[category] || '#6b7280';
            
            return (
              <div className="stat-row" key={category}>
                <div className="stat-category">
                  <span className="stat-dot" style={{ background: color }}></span>
                  <span>{category}</span>
                </div>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar" 
                    style={{ 
                      width: `${percentage}%`,
                      background: color
                    }}
                  ></div>
                </div>
                <div className="stat-count">{count}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatsCard;