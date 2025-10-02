import React, { useState, useEffect } from 'react';
import { getAccessLogs } from '../utils/api';
import ExtensionRequestModal from '../components/ExtensionRequestModal';
import { notify } from '../components/NotificationContainer';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionRequest, setExtensionRequest] = useState(null);
  const [notification, setNotification] = useState(null);

  // Simulate an extension request coming in after 5 seconds (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show the extension request if there are logs
      if (logs.length > 0) {
        const mockRequest = {
          requesterName: 'Dr. Sharma (City General Hospital)',
          recordCount: '3 medical records',
          currentExpiry: new Date(Date.now() + 3 * 60 * 1000).toLocaleString(), // 3 minutes from now
          reason: 'Need additional time to complete diagnosis and treatment plan'
        };
        
        setExtensionRequest(mockRequest);
        setShowExtensionModal(true);
        
        // Show a notification for the extension request
        notify('Dr. Sharma is requesting extended access to your medical records', 'warning', 10000);
        
        // Play a sound to alert the user (optional)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
          audio.play();
        } catch (e) {
          console.log('Audio notification not supported');
        }
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [logs]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getAccessLogs();
        
        if (response.success) {
          // Sort logs by timestamp (newest first)
          const sortedLogs = response.data.sort((a, b) => {
            const timeA = a.createdAt || a.accessedAt || a.revokedAt;
            const timeB = b.createdAt || b.accessedAt || b.revokedAt;
            return timeB - timeA;
          });
          setLogs(sortedLogs);
        } else {
          setError(response.message || 'Failed to fetch access logs');
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'SHARE_CREATED':
        return 'Records Shared';
      case 'SHARE_ACCESSED':
        return 'Records Accessed';
      case 'SHARE_REVOKED':
        return 'Access Revoked';
      case 'EXTENSION_GRANTED':
        return 'Access Extended';
      case 'EXTENSION_DENIED':
        return 'Extension Denied';
      default:
        return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'SHARE_CREATED':
        return 'var(--success-color)';
      case 'SHARE_ACCESSED':
        return 'var(--info-color)';
      case 'SHARE_REVOKED':
        return 'var(--danger-color)';
      case 'EXTENSION_GRANTED':
        return 'var(--secondary-color)';
      case 'EXTENSION_DENIED':
        return 'var(--warning-color)';
      default:
        return 'var(--text-light)';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'SHARE_CREATED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        );
      case 'SHARE_ACCESSED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        );
      case 'SHARE_REVOKED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        );
      case 'EXTENSION_GRANTED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'EXTENSION_DENIED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  const handleApproveExtension = (minutes) => {
    // In a real app, this would send the approval to the backend
    // For demo purposes, we'll just add a new log entry
    const newLog = {
      id: `log-${Date.now()}`,
      action: 'EXTENSION_GRANTED',
      createdAt: Date.now(),
      recordIds: ['rec-001', 'rec-002', 'rec-003'],
      accessToken: 'ext-token-' + Math.random().toString(36).substring(2, 10),
      userId: 'user-001',
      aadhaarNumber: '123456789012'
    };
    
    setLogs([newLog, ...logs]);
    setShowExtensionModal(false);
    
    // Show notification using the global notification system
    notify(`Access extended by ${minutes} minutes for Dr. Sharma`, 'success', 5000);
    
    // Also update the local notification state for the UI
    setNotification({
      type: 'success',
      message: `Access extended by ${minutes} minutes for Dr. Sharma`
    });
    
    // Clear local notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleDenyExtension = () => {
    // In a real app, this would send the denial to the backend
    // For demo purposes, we'll just add a new log entry
    const newLog = {
      id: `log-${Date.now()}`,
      action: 'EXTENSION_DENIED',
      createdAt: Date.now(),
      recordIds: ['rec-001', 'rec-002', 'rec-003'],
      accessToken: 'ext-token-' + Math.random().toString(36).substring(2, 10),
      userId: 'user-001',
      aadhaarNumber: '123456789012'
    };
    
    setLogs([newLog, ...logs]);
    setShowExtensionModal(false);
    
    // Show notification using the global notification system
    notify('Extension request denied', 'warning', 5000);
    
    // Also update the local notification state for the UI
    setNotification({
      type: 'warning',
      message: 'Extension request denied'
    });
    
    // Clear local notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading access logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => window.location.reload()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      {notification && (
        <div className={`alert alert-${notification.type} mb-4 animate-fadeIn`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            {notification.type === 'success' ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            ) : (
              <circle cx="12" cy="12" r="10"></circle>
            )}
            {notification.type === 'success' ? (
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
          {notification.message}
        </div>
      )}

      <div className="card hover-card mb-4">
        <div className="flex items-center">
          <div className="card-icon primary" style={{ marginRight: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <div>
            <h2 className="card-title mb-1">Access Logs</h2>
            <p className="text-secondary" style={{ margin: 0 }}>
              Track when and how your medical records were shared and accessed
            </p>
          </div>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="card text-center p-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 20px auto', color: 'var(--text-light)' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 className="mb-2">No Access Logs Found</h3>
          <p className="text-secondary">Your records haven't been shared yet. When you share your records, the access logs will appear here.</p>
        </div>
      ) : (
        <div className="card hover-card">
          <div className="overflow-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Action</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Records</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Access Token</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: getActionColor(log.action),
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {getActionIcon(log.action)}
                        <span style={{ marginLeft: '6px' }}>{getActionLabel(log.action)}</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {formatTimestamp(log.createdAt || log.accessedAt || log.revokedAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {log.recordIds ? log.recordIds.length : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {log.accessToken}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="card hover-card glass-card mt-4">
        <div className="flex items-center mb-3">
          <div className="card-icon secondary" style={{ marginRight: '16px', width: '40px', height: '40px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.2rem', margin: 0 }}>Blockchain Verification</h3>
          </div>
        </div>
        <p>
          All access logs are securely recorded on the blockchain for immutable verification.
          This ensures that all access to your medical records is transparent and tamper-proof.
        </p>
        <button className="btn btn-outline-secondary mt-2" style={{ alignSelf: 'flex-start' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <rect x="1" y="3" width="22" height="5" rx="2" ry="2"></rect>
            <rect x="1" y="10" width="22" height="5" rx="2" ry="2"></rect>
            <rect x="1" y="17" width="22" height="5" rx="2" ry="2"></rect>
          </svg>
          View Blockchain Records
        </button>
      </div>

      <ExtensionRequestModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        onApprove={handleApproveExtension}
        onDeny={handleDenyExtension}
        requestDetails={extensionRequest}
      />
    </div>
  );
};

export default AccessLogs;