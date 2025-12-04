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

const ResultCard = ({ result }) => {
  if (!result) {
    return (
      <div className="card">
        <h2 className="card-title">📊 Classification Result</h2>
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>Submit a complaint to see the classification result</p>
        </div>
      </div>
    );
  }

  // Safe access with defaults
  const category = result.category || 'Unknown';
  const confidence = result.confidence || 0;
  const priority = result.priority || 'Medium';
  const keywordsMatched = result.keywords_matched || [];
  const message = result.message || `Classified as ${category}`;
  
  const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
  const color = categoryColors[category] || '#6b7280';

  return (
    <div className={`card result-card ${categoryClass}`} style={{ borderLeft: `5px solid ${color}` }}>
      <h2 className="card-title">📊 Classification Result</h2>
      
      <div className="success-message">
        ✅ {message}
      </div>

      <div className="result-category" style={{ color }}>
        {category}
      </div>

      <div className="result-meta">
        <div className="result-meta-item">
          <div className="result-meta-label">Confidence Score</div>
          <div className="result-meta-value">{(confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="result-meta-item">
          <div className="result-meta-label">Priority</div>
          <span className={`priority-badge ${priority.toLowerCase()}`}>
            {priority}
          </span>
        </div>
        <div className="result-meta-item">
          <div className="result-meta-label">Complaint ID</div>
          <div className="result-meta-value">#{result.id || 'N/A'}</div>
        </div>
        <div className="result-meta-item">
          <div className="result-meta-label">Category Total</div>
          <div className="result-meta-value">{result.category_count || 0}</div>
        </div>
      </div>

      {keywordsMatched.length > 0 && (
        <div>
          <div className="result-meta-label" style={{ marginBottom: '10px' }}>
            Keywords Matched
          </div>
          <div className="keywords-list">
            {keywordsMatched.map((keyword, index) => (
              <span key={index} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;