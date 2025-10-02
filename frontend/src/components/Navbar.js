import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const location = useLocation();
  
  // Don't show navbar on access pages
  if (location.pathname.includes('/access/')) {
    return null;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        <span className="gradient-text">AYUCONNECT</span>
      </Link>
      
      {isAuthenticated && (
        <div className="flex items-center">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <Link to="/profile" className="mr-4 text-primary" style={{ fontWeight: '600', textDecoration: 'none' }}>
            <div>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.8rem', opacity: '0.8' }}>
              Aadhaar: {user?.aadhaarNumber ? user.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') : 'Not available'}
            </div>
          </Link>
          
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/records" 
                className={`nav-link ${location.pathname === '/records' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Records
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/share" 
                className={`nav-link ${location.pathname === '/share' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/logs" 
                className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Access Logs
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/emergency-qr" 
                className={`nav-link ${location.pathname === '/emergency-qr' ? 'active' : ''}`}
                style={{ color: location.pathname === '/emergency-qr' ? 'var(--danger-color)' : 'var(--danger-color)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--danger-color)' }}>
                  <path d="M8 2h8l4 4v16H4V2h4z"></path>
                  <path d="M12 14v4"></path>
                  <path d="M12 10h.01"></path>
                </svg>
                Emergency QR
              </Link>
            </li>
            <li className="nav-item">
              <button 
                onClick={logout} 
                className="nav-link logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;