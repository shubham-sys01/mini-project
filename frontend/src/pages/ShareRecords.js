import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getAllRecords, generateShareToken } from '../utils/api';
import RecordCard from '../components/RecordCard';
import { notify } from '../components/NotificationContainer';

const ShareRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [shareStep, setShareStep] = useState(1); // 1: Select records, 2: QR code
  const [shareData, setShareData] = useState(null);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState([]);
  const [qrExpired, setQrExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getAllRecords();
        
        if (response.success) {
          setRecords(response.data);
        } else {
          setError(response.message || 'Failed to fetch records');
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, []);

  // Update selected record details when selectedRecords changes
  useEffect(() => {
    if (records.length > 0 && selectedRecords.length > 0) {
      const details = records.filter(record => selectedRecords.includes(record.id));
      setSelectedRecordDetails(details);
    } else {
      setSelectedRecordDetails([]);
    }
  }, [selectedRecords, records]);

  const handleRecordSelect = (recordId) => {
    setSelectedRecords(prevSelected => {
      if (prevSelected.includes(recordId)) {
        return prevSelected.filter(id => id !== recordId);
      } else {
        return [...prevSelected, recordId];
      }
    });
  };

  // Add effect to handle QR code expiration
  useEffect(() => {
    if (shareStep === 2 && shareData) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start a timer to check expiry
      timerRef.current = setInterval(() => {
        const now = new Date();
        const expiryTime = new Date(shareData.expiresAt);
        const diffMs = expiryTime - now;
        
        if (diffMs <= 0) {
          // QR code has expired
          setQrExpired(true);
          clearInterval(timerRef.current);
          notify('The QR code has expired', 'error', 5000);
        } else {
          // Update time remaining
          const diffMins = Math.floor(diffMs / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          setTimeRemaining(`${diffMins}m ${diffSecs}s`);
          
          // Notify when close to expiry
          if (diffMs <= 60000 && diffMs > 59000) { // 1 minute warning
            notify('QR code will expire in 1 minute', 'warning', 5000);
          }
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [shareStep, shareData]);

  const handleShareRecords = async () => {
    if (selectedRecords.length === 0) {
      setError('Please select at least one record to share');
      return;
    }
    
    setLoading(true);
    setError('');
    setQrExpired(false);
    
    try {
      const response = await generateShareToken(selectedRecords, expiryMinutes);
      
      if (response.success) {
        setShareData(response.data);
        setShareStep(2);
        notify(`QR code generated successfully. Valid for ${expiryMinutes} minutes.`, 'success', 5000);
      } else {
        setError(response.message || 'Failed to generate share token');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiryTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeRemaining = (timestamp) => {
    const now = new Date();
    const expiryTime = new Date(timestamp);
    const diffMs = expiryTime - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}m ${diffSecs}s`;
  };

  const getRecordTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'lab report':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15l-2 2 2 2"></path>
            <path d="M15 15l2 2-2 2"></path>
            <path d="M12 9v6"></path>
          </svg>
        );
      case 'prescription':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
            <path d="M9 12h6"></path>
            <path d="M12 9v6"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
    }
  };

  if (loading && shareStep === 1) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your health records...</p>
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
          onClick={() => setError('')}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      {shareStep === 1 ? (
        <>
          <div className="card hover-card mb-4">
            <div className="card-header">
              <div className="flex items-center">
                <div className="card-icon secondary" style={{ marginRight: '16px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </div>
                <h2 className="card-title">Share Medical Records</h2>
              </div>
              <div className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                Selected: {selectedRecords.length}
              </div>
            </div>
            <p className="mb-4">
              Select the records you want to share with healthcare providers.
              A QR code will be generated that can be scanned to access these records.
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="expiryMinutes">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Access Expiry Time
              </label>
              <select
                id="expiryMinutes"
                className="form-control"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                style={{ maxWidth: '250px' }}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
              <p className="form-text">
                After this time, the shared access will automatically expire
              </p>
            </div>
            
            {selectedRecords.length > 0 && (
              <div className="card glass-card mb-4 p-3">
                <div className="flex justify-between items-center">
                  <h4 style={{ margin: 0, fontWeight: 600 }}>Selected Records</h4>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setSelectedRecords([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="mt-3">
                  {selectedRecordDetails.map(record => (
                    <div key={record.id} className="flex items-center mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                      {getRecordTypeIcon(record.type)}
                      <span className="ml-2">{record.title}</span>
                      <span className="ml-auto badge badge-primary" style={{ backgroundColor: 'var(--secondary-color)' }}>{record.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {records.map(record => (
              <RecordCard 
                key={record.id} 
                record={record} 
                isSelectable={true}
                isSelected={selectedRecords.includes(record.id)}
                onSelect={handleRecordSelect}
              />
            ))}
          </div>
          
          <div className="flex justify-between">
            <Link to="/records" className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Records
            </Link>
            
            <button 
              className="btn btn-secondary"
              onClick={handleShareRecords}
              disabled={selectedRecords.length === 0}
            >
              {selectedRecords.length === 0 ? (
                'Select Records First'
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="card hover-card animate-slideUp">
          <div className="text-center mb-4">
            <div className="card-icon secondary" style={{ margin: '0 auto 16px auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
            </div>
            <h2 className="card-title mb-2">Secure Access QR Code</h2>
            <p>
              Scan this QR code to access the selected medical records.
            </p>
            <div className="qr-expiry">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Expires at: {formatExpiryTime(shareData.expiresAt)}
              <span className="ml-2" style={{ fontWeight: 'bold' }}>
                (Time remaining: {qrExpired ? 'Expired' : timeRemaining || getTimeRemaining(shareData.expiresAt)})
              </span>
            </div>
          </div>
          
          <div className="qr-container">
            <div className="qr-code" style={{ padding: '24px', border: '2px dashed var(--border-color)' }}>
              {qrExpired ? (
                <div className="expired-qr">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <h3 style={{ color: 'var(--danger-color)', margin: '0 0 8px 0' }}>QR Code Expired</h3>
                  <p style={{ margin: '0 0 16px 0' }}>This QR code is no longer valid</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShareStep(1);
                      setQrExpired(false);
                    }}
                  >
                    Generate New QR
                  </button>
                </div>
              ) : (
                <QRCodeSVG 
                  value={shareData.accessUrl} 
                  size={280}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#1976d2"
                />
              )}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="mb-2">
              <strong>Access URL:</strong>
            </p>
            <div className="qr-url">
              {shareData.accessUrl}
            </div>
          </div>
          
          <div className="card glass-card mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <strong>Records Shared:</strong> {selectedRecords.length}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <strong>Expires:</strong> {formatExpiryTime(shareData.expiresAt)}
                </div>
              </div>
              <div className="badge badge-warning" style={{ padding: '8px 16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Temporary Access
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="btn btn-outline"
              onClick={() => setShareStep(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Reset and go back to dashboard
                setShareStep(1);
                setSelectedRecords([]);
                setShareData(null);
                window.location.href = '/dashboard';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareRecords;