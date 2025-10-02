import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRecords } from '../utils/api';
import RecordCard from '../components/RecordCard';

const Dashboard = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    byType: {}
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await getAllRecords();
        
        if (response.success) {
          setRecords(response.data);
          
          // Calculate stats
          const byType = {};
          response.data.forEach(record => {
            if (byType[record.type]) {
              byType[record.type]++;
            } else {
              byType[record.type] = 1;
            }
          });
          
          setStats({
            total: response.data.length,
            byType
          });
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

  const getRecentRecords = () => {
    // Sort records by date (newest first) and get the first 3
    return [...records]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'lab report':
        return 'var(--success-color)';
      case 'prescription':
        return 'var(--info-color)';
      case 'imaging':
        return 'var(--primary-color)';
      case 'discharge summary':
        return 'var(--warning-color)';
      case 'vaccination':
        return 'var(--accent-color)';
      default:
        return 'var(--text-light)';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'lab report':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15l-2 2 2 2"></path>
            <path d="M15 15l2 2-2 2"></path>
            <path d="M12 9v6"></path>
          </svg>
        );
      case 'prescription':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
            <path d="M9 12h6"></path>
            <path d="M12 9v6"></path>
          </svg>
        );
      case 'imaging':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case 'discharge summary':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'vaccination':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2z"></path>
            <path d="M7 12h10"></path>
            <path d="M12 7v10"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
    }
  };

  if (loading) {
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
      <div className="card mb-4" style={{ 
        backgroundColor: 'rgba(211, 47, 47, 0.1)', 
        borderColor: 'var(--danger-color)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: 'var(--border-radius)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="card-icon danger" style={{ marginRight: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8l4 4v16H4V2h4z"></path>
                <path d="M12 14v4"></path>
                <path d="M12 10h.01"></path>
              </svg>
            </div>
            <div>
              <h3 style={{ color: 'var(--danger-color)', margin: '0 0 4px 0' }}>Emergency Preparedness</h3>
              <p style={{ margin: 0 }}>Create an emergency QR code for first responders to access your critical medical information</p>
            </div>
          </div>
          <Link to="/emergency-qr" className="btn btn-danger pulse-danger" style={{ whiteSpace: 'nowrap' }}>
            Create Now
          </Link>
        </div>
      </div>
      
      <div className="card hover-card mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-3">
            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem', marginRight: '16px' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="card-title mb-1">Welcome, {user?.name || 'User'}</h2>
              <p className="text-secondary" style={{ margin: 0 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <Link to="/emergency-qr" className="btn btn-danger pulse-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2h8l4 4v16H4V2h4z"></path>
              <path d="M12 14v4"></path>
              <path d="M12 10h.01"></path>
            </svg>
            Emergency QR
          </Link>
        </div>
        <p>
          Your health records are securely stored and ready to be shared with healthcare providers.
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="stats-card hover-card">
          <div className="card-icon primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 className="stats-number">{stats.total}</h3>
          <p className="stats-label">Total Records</p>
        </div>
        
        {Object.entries(stats.byType).map(([type, count], index) => (
          <div className="stats-card hover-card" key={type}>
            <div className="card-icon" style={{ backgroundColor: getTypeColor(type) }}>
              {getTypeIcon(type)}
            </div>
            <h3 className="stats-number" style={{ color: getTypeColor(type) }}>{count}</h3>
            <p className="stats-label">{type}</p>
          </div>
        ))}
      </div>
      
      <div className="card hover-card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            Recent Medical Records
          </h3>
          <Link to="/records" className="btn btn-sm btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            View All Records
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {getRecentRecords().map(record => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="card hover-card glass-card">
          <div className="card-icon secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <h3 className="card-title mb-2">Share Your Records</h3>
          <p className="mb-4">
            Securely share your medical records with healthcare providers using QR code.
            The shared access is temporary and can be revoked at any time.
          </p>
          <Link to="/share" className="btn btn-secondary pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share Now
          </Link>
        </div>
        
        <div className="card hover-card glass-card">
          <div className="card-icon danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2h8l4 4v16H4V2h4z"></path>
              <path d="M12 14v4"></path>
              <path d="M12 10h.01"></path>
            </svg>
          </div>
          <h3 className="card-title mb-2">Emergency QR</h3>
          <p className="mb-4">
            Create a permanent QR code for emergency situations. Select critical medical information
            that should be accessible without login in case of emergency.
          </p>
          <Link to="/emergency-qr" className="btn btn-danger">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="3"></rect>
              <rect x="14" y="7" width="3" height="3"></rect>
              <rect x="7" y="14" width="3" height="3"></rect>
              <rect x="14" y="14" width="3" height="3"></rect>
            </svg>
            Create Emergency QR
          </Link>
        </div>
        
        <div className="card hover-card glass-card">
          <div className="card-icon accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <h3 className="card-title mb-2">Access Logs</h3>
          <p className="mb-4">
            View a complete history of who accessed your medical records, when they were accessed,
            and which records were viewed.
          </p>
          <Link to="/logs" className="btn btn-outline-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            View Access Logs
          </Link>
        </div>
      </div>
      
      <div className="fab-container">
        <Link to="/emergency-qr" className="fab" style={{ backgroundColor: 'var(--danger-color)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2h8l4 4v16H4V2h4z"></path>
            <path d="M12 14v4"></path>
            <path d="M12 10h.01"></path>
          </svg>
        </Link>
        
        <Link to="/share" className="fab" style={{ bottom: '90px', backgroundColor: 'var(--primary-color)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;