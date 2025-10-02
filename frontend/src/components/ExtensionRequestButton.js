import React, { useState } from 'react';

const ExtensionRequestButton = ({ onRequestExtension, timeRemaining, disabled }) => {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRequestExtension(reason);
    setShowForm(false);
    setReason('');
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="mt-4">
      {!showForm ? (
        <button 
          className="btn btn-outline-secondary"
          onClick={() => setShowForm(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Request Time Extension
        </button>
      ) : (
        <div className="card glass-card p-3 animate-fadeIn">
          <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>Request Access Extension</h4>
          <p className="mb-3 text-secondary" style={{ fontSize: '0.9rem' }}>
            Current access expires in: <strong>{timeRemaining}</strong>
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="reason">Reason for extension</label>
              <textarea
                id="reason"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for requesting extended access..."
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="btn btn-outline mr-2"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!reason.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExtensionRequestButton;