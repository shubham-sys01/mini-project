import React, { useState, useRef, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { loginWithAadhaar, verifyOtp } from '../utils/api';
import { getSessionId, setSessionId } from '../utils/auth';

const AadhaarLogin = ({ login }) => {
  const history = useHistory();
  const location = useLocation();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // For development only
  const [formattedAadhaar, setFormattedAadhaar] = useState('');
  const otpInputRef = useRef(null);
  const [digilockerUrl, setDigilockerUrl] = useState('');
  const [digilockerLoading, setDigilockerLoading] = useState(true);
  const [digilockerError, setDigilockerError] = useState('');
  const [sessionid, setSessionid] = useState(null);

  // Handle DigiLocker callback
  useEffect(() => {
    const handleDigilockerCallback = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      const code = params.get('code');
      
      if (sessionId) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8080/api/digilocker/callback?session_id=${sessionId}`);
          const data = await response.json();
          
          if (data.success && data.user) {
            // Store session ID and login user with Aadhaar data
            setSessionId(sessionId);
            // Include Aadhaar data in user object for dashboard
            const userWithAadhaarData = {
              ...data.user,
              aadhaarData: data.aadhaarData || null
            };
            login(sessionId, userWithAadhaarData, true);
            // Clear URL parameters
            history.replace('/');
          } else {
            setError(data.message || 'DigiLocker authentication failed');
          }
        } catch (err) {
          console.error('DigiLocker callback error:', err);
          setError('Unable to complete DigiLocker authentication');
        } finally {
          setLoading(false);
        }
      }
    };

    handleDigilockerCallback();
  }, [location.search, history, login]);

  // Check for existing session on mount
  useEffect(() => {
    const existingSessionId = getSessionId();
    if (existingSessionId) {
      // Verify the session is still valid
      fetch(`http://localhost:8080/api/digilocker/verify-session?session_id=${existingSessionId}`, {
        headers: {
          'x-session-id': existingSessionId
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            // Include Aadhaar data in user object for dashboard
            const userWithAadhaarData = {
              ...data.user,
              aadhaarData: data.aadhaarData || null
            };
            login(existingSessionId, userWithAadhaarData, true);
          } else {
            // Session invalid, remove it
            localStorage.removeItem('sessionid');
          }
        })
        .catch(err => {
          console.error('Session verification error:', err);
          localStorage.removeItem('sessionid');
        });
    }
  }, [login]);

  // Initialize DigiLocker session
  useEffect(() => {
    let isMounted = true;
    
    const initializeDigilockerSession = async () => {
      try {
        setDigilockerLoading(true);
        setDigilockerError('');
        const response = await fetch('http://localhost:8080/api/digilocker/session');
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to initialize DigiLocker session');
        }

        if (isMounted) {
          setDigilockerUrl(data.data.authorizationUrl);
          if (data.data.session_id) {
            setSessionid(data.data.session_id);
            // Note: session_id will be stored in localStorage after successful callback
          }
        }
      } catch (err) {
        if (isMounted) {
          setDigilockerError(err.message || 'Unable to initialize DigiLocker session');
        }
      } finally {
        if (isMounted) {
          setDigilockerLoading(false);
        }
      }
    };

    initializeDigilockerSession();

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    if (aadhaarNumber) {
      const formatted = aadhaarNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormattedAadhaar(formatted);
    } else {
      setFormattedAadhaar('');
    }
  }, [aadhaarNumber]);

  // Focus on OTP input when switching to OTP screen
  useEffect(() => {
    if (otpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpSent]);

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    
    // Remove spaces for validation
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    
    // Basic validation
    if (!cleanAadhaar || cleanAadhaar.length !== 12 || !/^\d+$/.test(cleanAadhaar)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await loginWithAadhaar(cleanAadhaar);
      
      if (response.success) {
        setOtpSent(true);
        
        // For development only
        if (response.devOtp) {
          setDevOtp(response.devOtp);
        }
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, accept any 6-digit OTP
      // In production, this would validate against the actual OTP
      const response = await verifyOtp(aadhaarNumber.replace(/\s/g, ''), otp);
      
      if (response.success) {
        // Login successful - use token-based login (default method)
        login(response.token, response.user, false);
      } else {
        setError(response.message || 'Invalid OTP');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 12) {
      setAadhaarNumber(value);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="login-container animate-fadeIn">
      <div className="login-card animate-slideUp">
        <div className="login-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="login-title gradient-text">AYUCONNECT</h1>
          <p className="login-subtitle">Secure Healthcare Records System</p>
        </div>

        <div className="mb-4">
          {digilockerUrl ? (
            <a
              className="btn btn-outline btn-block"
              href={digilockerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Login using DigiLocker
            </a>
          ) : (
            <button className="btn btn-outline btn-block" type="button" disabled={digilockerLoading}>
              {digilockerLoading ? 'Preparing DigiLocker session...' : 'DigiLocker unavailable'}
            </button>
          )}
          {digilockerError && (
            <p className="form-text" style={{ color: 'var(--danger-color)' }}>
              {digilockerError}
            </p>
          )}
        </div>
        
        {error && (
          <div className="alert alert-danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        <div className="login-form">
          {!otpSent ? (
            <form onSubmit={handleAadhaarSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="aadhaar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Aadhaar Number
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    id="aadhaar"
                    className="form-control"
                    placeholder="XXXX XXXX XXXX"
                    value={formattedAadhaar}
                    onChange={handleAadhaarChange}
                    required
                    autoFocus
                  />
                </div>
                <p className="form-text">
                  Enter your 12-digit Aadhaar number for secure authentication
                </p>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Send OTP
                  </>
                )}
              </button>
              
              <div className="login-divider">
                <span className="login-divider-text">Secure Authentication</span>
              </div>
              
              <div className="login-footer">
                <p>
                  Your medical records are protected with Aadhaar-based verification
                </p>
                <p className="mt-2">
                  <small>For demo, enter any 12-digit number</small>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="animate-fadeIn">
              <div className="form-group">
                <label className="form-label" htmlFor="otp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  className="form-control"
                  placeholder="Enter the 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  required
                  ref={otpInputRef}
                />
                <p className="form-text">
                  OTP sent to your registered mobile number ending with XXXX
                </p>
                
                {/* For development only */}
                {devOtp && (
                  <div className="alert alert-success mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div>
                      <p>Development OTP: {devOtp}</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        (This is shown only in development mode)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verify OTP
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setDevOtp('');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Change Aadhaar Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AadhaarLogin;