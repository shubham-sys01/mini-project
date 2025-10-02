import React, { useState, useEffect } from 'react';
import { accessEmergencyRecords, getRecordById } from '../utils/api';
import RecordCard from '../components/RecordCard';

const EmergencyView = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emergencyData, setEmergencyData] = useState(null);
  const [records, setRecords] = useState([]);
  
  const token = match.params.token;

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const response = await accessEmergencyRecords(token);
        
        if (response.success) {
          setEmergencyData(response.data);
          
          // Fetch each record
          const recordPromises = response.data.recordIds.map(id => getRecordById(id));
          const recordResponses = await Promise.all(recordPromises);
          
          const fetchedRecords = recordResponses.map(res => res.data);
          setRecords(fetchedRecords);
        } else {
          setError(response.message || 'Failed to access emergency records');
        }
      } catch (error) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencyData();
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2 className="gradient-text mt-4" style={{ fontSize: '1.8rem', color: '#d32f2f' }}>EMERGENCY MEDICAL INFO</h2>
        <p className="loading-text">Accessing emergency medical records...</p>
      </div>
    );
  }

  if (error) {
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
            Access Error
          </h2>
          <p className="mb-4">
            {error}
          </p>
          <div className="mt-3">
            <a href="/" className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      <div className="card hover-card mb-4" style={{ borderColor: 'var(--danger-color)', borderWidth: '2px' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="card-icon danger" style={{ marginRight: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8l4 4v16H4V2h4z"></path>
                <path d="M12 14v4"></path>
                <path d="M12 10h.01"></path>
              </svg>
            </div>
            <h2 className="card-title">Emergency Medical Information</h2>
          </div>
          <div className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
            EMERGENCY
          </div>
        </div>
        
        <p className="mt-3">
          This is emergency medical information that has been pre-selected by the patient.
          Please use this information for emergency medical purposes only.
        </p>

        {emergencyData?.emergencyContact && (
          <div className="alert alert-warning mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <div>
              <strong>Emergency Contact:</strong> {emergencyData.emergencyContact}
            </div>
          </div>
        )}
        
        {emergencyData?.emergencyInfo && (
          <div className="card glass-card mt-3 p-3">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: 'var(--danger-color)' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <strong>Critical Information:</strong>
            </div>
            <p style={{ whiteSpace: 'pre-line', marginLeft: '30px' }}>{emergencyData.emergencyInfo}</p>
          </div>
        )}
      </div>
      
      <h3 className="section-title" style={{ color: 'var(--danger-color)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Emergency Medical Records
      </h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {records.map(record => (
          <RecordCard 
            key={record.id} 
            record={record} 
            isEmergency={true}
          />
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
          These records are provided for emergency medical purposes only.
          Please respect the patient's privacy and only use this information for immediate medical care.
        </p>
      </div>
    </div>
  );
};

export default EmergencyView;