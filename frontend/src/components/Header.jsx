import React from 'react';

const Header = ({ stats }) => {
  return (
    <header className="header">
      <h1>🎯 Complaint Classifier</h1>
      <p>AI-powered customer complaint categorization system</p>
      
      <div className="header-stats">
        <div className="header-stat">
          <div className="header-stat-value">{stats.total_complaints}</div>
          <div className="header-stat-label">Total Complaints</div>
        </div>
        <div className="header-stat">
          <div className="header-stat-value">
            {stats.average_confidence ? `${(stats.average_confidence * 100).toFixed(0)}%` : '0%'}
          </div>
          <div className="header-stat-label">Avg. Confidence</div>
        </div>
        <div className="header-stat">
          <div className="header-stat-value">{stats.most_common_category || 'N/A'}</div>
          <div className="header-stat-label">Most Common</div>
        </div>
      </div>
    </header>
  );
};

export default Header;