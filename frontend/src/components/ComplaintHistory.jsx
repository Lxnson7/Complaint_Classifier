import React from 'react';

const categoryColors = {
  'Payment Issue': { bg: '#fef3c7', color: '#d97706' },
  'Delivery Issue': { bg: '#dbeafe', color: '#2563eb' },
  'Product Defect': { bg: '#fee2e2', color: '#dc2626' },
  'Refund Request': { bg: '#d1fae5', color: '#059669' },
  'Account Problem': { bg: '#ede9fe', color: '#7c3aed' },
  'Fraud': { bg: '#fee2e2', color: '#dc2626' },
  'General Query': { bg: '#f3f4f6', color: '#4b5563' }
};

const ComplaintHistory = ({ complaints }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="card">
      <h2 className="card-title">📋 Recent Complaints</h2>
      
      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No complaints submitted yet</p>
        </div>
      ) : (
        <div className="history-list">
          {complaints.slice().reverse().map((complaint) => {
            const colors = categoryColors[complaint.category] || { bg: '#f3f4f6', color: '#4b5563' };
            
            return (
              <div className="history-item" key={complaint.id}>
                <div className="history-text">{complaint.complaint}</div>
                <div className="history-meta">
                  <span 
                    className="history-category"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    {complaint.category}
                  </span>
                  <span className="history-time">{formatTime(complaint.timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintHistory;