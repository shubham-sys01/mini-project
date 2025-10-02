import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { accessSharedRecords, getRecordById } from '../utils/api';
import RecordCard from '../components/RecordCard';
import ExtensionRequestButton from '../components/ExtensionRequestButton';
import { notify } from '../components/NotificationContainer';

const ScanQR = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessData, setAccessData] = useState(null);
  const [records, setRecords] = useState([]);
  const [accessExpired, setAccessExpired] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [extensionRequested, setExtensionRequested] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState(null); // 'pending', 'approved', 'denied'
  const [isExpiring, setIsExpiring] = useState(false);
  
  const token = match.params.token;
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAccessData = async () => {
      try {
        const response = await accessSharedRecords(token);
        
        if (response.success) {
          setAccessData(response.data);
          
          // Calculate countdown
          const expiryTime = new Date(response.data.expiresAt).getTime();
          const currentTime = Date.now();
          const timeLeft = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
          
          setCountdown(timeLeft);
          
          // Fetch each record
          const recordPromises = response.data.recordIds.map(id => getRecordById(id));
          const recordResponses = await Promise.all(recordPromises);
          
          const fetchedRecords = recordResponses.map(res => res.data);
          setRecords(fetchedRecords);
        } else {
          setError(response.message || 'Failed to access shared records');
          if (response.message && response.message.includes('expired')) {
            setAccessExpired(true);
          }
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
        if (error.message && error.message.includes('expired')) {
          setAccessExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccessData();
  }, [token]);

  useEffect(() => {
    // Countdown timer
    if (countdown === null) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCountdown(prevCountdown => {
        // Check if we're getting close to expiry (less than 2 minutes)
        if (prevCountdown <= 120 && prevCountdown > 119 && !isExpiring) {
          setIsExpiring(true);
          notify('Access will expire in 2 minutes. Consider requesting an extension if needed.', 'warning', 10000);
        }
        
        // Check if we're getting very close to expiry (less than 30 seconds)
        if (prevCountdown <= 30 && prevCountdown > 29) {
          notify('Access will expire in 30 seconds!', 'error', 10000);
        }
        
        if (prevCountdown <= 1) {
          clearInterval(timerRef.current);
          setAccessExpired(true);
          notify('Your access has expired', 'error', 5000);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown, isExpiring]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExtensionRequest = (reason) => {
    // In a real app, this would send the request to the backend
    // For demo purposes, we'll just simulate the request
    setExtensionRequested(true);
    setExtensionStatus('pending');
    
    // Notify the user that the request has been sent
    notify('Extension request sent to the patient', 'info', 3000);
    
    // Simulate a response after 3 seconds
    setTimeout(() => {
      // Randomly approve or deny for demo purposes
      const approved = Math.random() > 0.3; // 70% chance of approval
      
      if (approved) {
        setExtensionStatus('approved');
        // Add 15 minutes to the countdown
        setCountdown(prevCountdown => prevCountdown + (15 * 60));
        // Reset the expiring flag since we've extended the time
        setIsExpiring(false);
        // Notify the user that the request has been approved
        notify('Extension request approved! Access time has been extended.', 'success', 5000);
      } else {
        setExtensionStatus('denied');
        // Notify the user that the request has been denied
        notify('Extension request denied by the patient.', 'error', 5000);
      }
      
      // Reset after 5 seconds
      setTimeout(() => {
        setExtensionRequested(false);
        setExtensionStatus(null);
      }, 5000);
    }, 3000);
  };

  const getStatusNotification = () => {
    if (extensionStatus === 'pending') {
      return (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Your extension request has been sent. Waiting for patient approval...
        </div>
      );
    } else if (extensionStatus === 'approved') {
      return (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Extension approved! Access time has been extended.
        </div>
      );
    } else if (extensionStatus === 'denied') {
      return (
        <div className="alert alert-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Extension request denied by the patient.
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2 className="gradient-text mt-4" style={{ fontSize: '1.8rem' }}>AYUCONNECT</h2>
        <p className="loading-text">Accessing shared medical records...</p>
      </div>
    );
  }

  if (error || accessExpired) {
    return (
      <div className="page-container">
        <div className="card text-center p-5 animate-fadeIn">
          <div className="card-icon danger" style={{ margin: '0 auto 20px auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2 className="card-title mb-3" style={{ color: 'var(--danger-color)' }}>
            {accessExpired ? 'Access Expired' : 'Access Error'}
          </h2>
          <p className="mb-4">
            {accessExpired 
              ? 'This shared access link has expired or has been revoked by the patient.'
              : error}
          </p>
          <div className="mt-3">
            <Link to="/" className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      <div className="card hover-card mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="card-icon secondary" style={{ marginRight: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h2 className="card-title">Shared Medical Records</h2>
          </div>
          {countdown > 0 && (
            <div className="qr-expiry" style={{ margin: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Expires in: {formatCountdown(countdown)}
            </div>
          )}
        </div>
        
        <p className="mt-3">
          These medical records have been securely shared with you by the patient.
          This access is temporary and will expire as indicated above.
        </p>

        {getStatusNotification()}
        
        <ExtensionRequestButton 
          onRequestExtension={handleExtensionRequest}
          timeRemaining={formatCountdown(countdown)}
          disabled={extensionRequested || countdown > 300} // Only show if less than 5 minutes remaining
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {records.map(record => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
      
      <div className="card glass-card">
        <div className="card-header">
          <h3 className="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Important Notice
          </h3>
        </div>
        <p>
          These records are shared for medical purposes only and this access is being logged.
          Unauthorized use, distribution, or storage is strictly prohibited and may result in legal action.
        </p>
      </div>
    </div>
  );
};

export default ScanQR;