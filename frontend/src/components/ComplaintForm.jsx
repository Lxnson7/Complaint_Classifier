import React, { useState } from 'react';

const ComplaintForm = ({ onSubmit, isLoading }) => {
  const [complaint, setComplaint] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState('');

  const sampleComplaints = [
    "I was charged twice for my order and need a refund immediately",
    "My package hasn't arrived yet and tracking shows it's been stuck for 5 days",
    "The laptop screen is cracked and the keyboard is not working",
    "I want a full refund for the cancelled order, it's been 2 weeks",
    "I can't login to my account, password reset is not working",
    "There's an unauthorized transaction of $500 on my card"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (complaint.trim().length < 10) {
      setError('Complaint must be at least 10 characters long');
      return;
    }

    onSubmit({
      complaint: complaint.trim(),
      customer_id: customerId.trim() || null
    });
  };

  const fillSample = (e) => {
    e.preventDefault(); // Prevent any form submission
    const randomSample = sampleComplaints[Math.floor(Math.random() * sampleComplaints.length)];
    setComplaint(randomSample);
  };

  return (
    <div className="card">
      <h2 className="card-title">📝 Submit Complaint</h2>
      
      <form className="complaint-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="complaint">Complaint Text *</label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Describe your complaint in detail..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="customerId">Customer ID (Optional)</label>
          <input
            type="text"
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="e.g., CUST12345"
          />
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Classifying...' : '🔍 Classify Complaint'}
        </button>

        <button 
          type="button" 
          onClick={fillSample}
          className="sample-btn"
          style={{
            background: 'transparent',
            border: '2px dashed #667eea',
            color: '#667eea',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '10px',
            width: '100%'
          }}
        >
          📋 Fill Sample Complaint
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;