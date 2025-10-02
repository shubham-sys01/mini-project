import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { getAllRecords, generateEmergencyToken } from '../utils/api';
import RecordCard from '../components/RecordCard';
import { notify } from '../components/NotificationContainer';

const EmergencyQR = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [emergencyStep, setEmergencyStep] = useState(1); // 1: Select records, 2: QR code
  const [emergencyData, setEmergencyData] = useState(null);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyInfo, setEmergencyInfo] = useState('');

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

  const handleGenerateEmergencyQR = async () => {
    if (selectedRecords.length === 0) {
      setError('Please select at least one record for emergency access');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await generateEmergencyToken(selectedRecords, emergencyContact, emergencyInfo);
      
      if (response.success) {
        setEmergencyData(response.data);
        setEmergencyStep(2);
        notify('Emergency QR code generated successfully', 'success', 5000);
      } else {
        setError(response.message || 'Failed to generate emergency token');
      }
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('emergency-qr-code');
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'emergency-medical-qr.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    notify('QR code downloaded successfully', 'success', 3000);
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const qrCode = document.getElementById('emergency-qr-code');
    
    if (!qrCode || !printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Emergency Medical QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              border: 2px solid #ddd;
              padding: 20px;
              border-radius: 10px;
            }
            .header {
              margin-bottom: 20px;
              color: #d32f2f;
            }
            .qr-container {
              margin: 20px 0;
            }
            .info {
              margin-top: 20px;
              font-size: 14px;
              color: #555;
            }
            .emergency-info {
              margin-top: 15px;
              padding: 10px;
              background-color: #f8f8f8;
              border-radius: 5px;
              text-align: left;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>EMERGENCY MEDICAL INFORMATION</h2>
              <p>Scan this QR code to access critical medical information</p>
            </div>
            <div class="qr-container">
              <img src="${qrCode.toDataURL()}" width="300" height="300" />
            </div>
            <div class="info">
              <p><strong>Emergency Contact:</strong> ${emergencyContact || 'Not provided'}</p>
              <div class="emergency-info">
                <p><strong>Additional Information:</strong></p>
                <p>${emergencyInfo || 'No additional information provided'}</p>
              </div>
            </div>
            <div class="footer">
              <p>This QR code provides access to pre-selected medical records in case of emergency.</p>
              <p>Keep this document in an easily accessible location.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    notify('Print window opened', 'info', 3000);
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

  if (loading && emergencyStep === 1) {
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
      {emergencyStep === 1 ? (
        <>
          <div className="card hover-card mb-4">
            <div className="card-header">
              <div className="flex items-center">
                <div className="card-icon danger" style={{ marginRight: '16px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2h8l4 4v16H4V2h4z"></path>
                    <path d="M12 14v4"></path>
                    <path d="M12 10h.01"></path>
                  </svg>
                </div>
                <h2 className="card-title">Emergency QR Generator</h2>
              </div>
              <div className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                Selected: {selectedRecords.length}
              </div>
            </div>
            <p className="mb-4">
              Select critical medical records that should be accessible in case of an emergency.
              A permanent QR code will be generated that can be printed and carried with you.
            </p>
            
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="emergencyContact">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Emergency Contact (Optional)
              </label>
              <input
                type="text"
                id="emergencyContact"
                className="form-control"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name and phone number of emergency contact"
                style={{ maxWidth: '500px' }}
              />
              <p className="form-text">
                This information will be displayed alongside the QR code
              </p>
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="emergencyInfo">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Additional Emergency Information (Optional)
              </label>
              <textarea
                id="emergencyInfo"
                className="form-control"
                value={emergencyInfo}
                onChange={(e) => setEmergencyInfo(e.target.value)}
                placeholder="Allergies, conditions, medications, or other critical information"
                rows={4}
                style={{ maxWidth: '500px' }}
              />
              <p className="form-text">
                This information will be displayed alongside the QR code
              </p>
            </div>
            
            {selectedRecords.length > 0 && (
              <div className="card glass-card mb-4 p-3">
                <div className="flex justify-between items-center">
                  <h4 style={{ margin: 0, fontWeight: 600 }}>Selected Emergency Records</h4>
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
                      <span className="ml-auto badge badge-danger" style={{ backgroundColor: 'var(--danger-color)' }}>{record.type}</span>
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
            <Link to="/dashboard" className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Dashboard
            </Link>
            
            <button 
              className="btn btn-danger"
              onClick={handleGenerateEmergencyQR}
              disabled={selectedRecords.length === 0}
            >
              {selectedRecords.length === 0 ? (
                'Select Records First'
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <rect x="7" y="7" width="3" height="3"></rect>
                    <rect x="14" y="7" width="3" height="3"></rect>
                    <rect x="7" y="14" width="3" height="3"></rect>
                    <rect x="14" y="14" width="3" height="3"></rect>
                  </svg>
                  Generate Emergency QR
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="card hover-card animate-slideUp">
          <div className="text-center mb-4">
            <div className="card-icon danger" style={{ margin: '0 auto 16px auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8l4 4v16H4V2h4z"></path>
                <path d="M12 14v4"></path>
                <path d="M12 10h.01"></path>
              </svg>
            </div>
            <h2 className="card-title mb-2">Emergency Medical QR Code</h2>
            <p>
              This QR code provides immediate access to your critical medical information in case of emergency.
            </p>
            <div className="alert alert-danger mt-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <strong>Important:</strong> Print this QR code and keep it in your wallet, phone case, or other accessible location.
              </div>
            </div>
          </div>
          
          <div className="qr-container">
            <div className="emergency-qr-code" style={{ padding: '24px', border: '2px dashed var(--danger-color)', backgroundColor: 'rgba(211, 47, 47, 0.05)' }}>
              <QRCodeCanvas 
                id="emergency-qr-code"
                value={emergencyData?.accessUrl || 'https://example.com/emergency'} 
                size={280}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#d32f2f"
              />
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="mb-2">
              <strong>Emergency Access URL:</strong>
            </p>
            <div className="qr-url">
              {emergencyData?.accessUrl || 'https://example.com/emergency'}
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
                  <strong>Records Included:</strong> {selectedRecords.length}
                </div>
                {emergencyContact && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <strong>Emergency Contact:</strong> {emergencyContact}
                  </div>
                )}
              </div>
              <div className="badge badge-danger" style={{ padding: '8px 16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M8 2h8l4 4v16H4V2h4z"></path>
                  <path d="M12 14v4"></path>
                  <path d="M12 10h.01"></path>
                </svg>
                Emergency Access
              </div>
            </div>
            
            {emergencyInfo && (
              <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <strong>Additional Emergency Information:</strong>
                </div>
                <p style={{ whiteSpace: 'pre-line', marginLeft: '26px' }}>{emergencyInfo}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button 
              className="btn btn-outline"
              onClick={() => setEmergencyStep(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            
            <div>
              <button 
                className="btn btn-outline-primary mr-2"
                onClick={downloadQRCode}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download QR
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={printQRCode}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyQR;

