import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

// Pages
import AadhaarLogin from './pages/AadhaarLogin';
import Dashboard from './pages/Dashboard';
import RecordsList from './pages/RecordsList';
import ShareRecords from './pages/ShareRecords';
import ScanQR from './pages/ScanQR';
import AccessLogs from './pages/AccessLogs';
import EmergencyQR from './pages/EmergencyQR';
import EmergencyView from './pages/EmergencyView';
import UserProfile from './pages/UserProfile';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import NotificationContainer from './components/NotificationContainer';

// Utils
import { getToken, setToken, removeToken } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = getToken();
      
      if (token) {
        try {
          // Fetch user data
          const response = await fetch('http://localhost:8080/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid or expired
            removeToken();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          removeToken();
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('User logged in:', userData);
    console.log('Aadhaar Number:', userData.aadhaarNumber);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner"></div>
        <h2 className="gradient-text mt-4" style={{ fontSize: '1.8rem' }}>AYU CONNECT</h2>
        <p className="loading-text">Please wait while we set up your secure environment</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />
        <NotificationContainer />
        <div className="container">
          <Switch>
            <Route 
              exact 
              path="/" 
              render={(props) => 
                isAuthenticated ? (
                  <Redirect to="/dashboard" />
                ) : (
                  <AadhaarLogin {...props} login={login} />
                )
              } 
            />
            <PrivateRoute 
              exact 
              path="/dashboard" 
              component={Dashboard} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <PrivateRoute 
              exact 
              path="/records" 
              component={RecordsList} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <PrivateRoute 
              exact 
              path="/share" 
              component={ShareRecords} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <Route 
              exact 
              path="/access/:token" 
              component={ScanQR} 
            />
            <PrivateRoute 
              exact 
              path="/logs" 
              component={AccessLogs} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <PrivateRoute 
              exact 
              path="/emergency-qr" 
              component={EmergencyQR} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
            <Route 
              exact 
              path="/emergency/:token" 
              component={EmergencyView} 
            />
            <PrivateRoute 
              exact 
              path="/profile" 
              component={() => <UserProfile user={user} />} 
              isAuthenticated={isAuthenticated}
              user={user}
            />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;