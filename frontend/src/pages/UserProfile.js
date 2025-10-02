import React from 'react';

const UserProfile = ({ user }) => {
  // Styles
  const styles = {
    profileSection: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '2rem'
    },
    profileAvatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginRight: '2rem'
    },
    profileDetails: {
      flex: 1
    },
    profileItem: {
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    },
    label: {
      fontWeight: 'bold',
      display: 'block',
      marginBottom: '0.25rem',
      color: 'var(--primary-color)'
    },
    value: {
      fontSize: '1.1rem'
    }
  };

  if (!user) {
    return (
      <div className="card">
        <div className="card-body">
          <h2>User Profile</h2>
          <p>No user information available. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="gradient-text mb-4">User Profile</h2>
        
        <div style={styles.profileSection}>
          <div style={styles.profileAvatar}>
            {user.name.split(' ').map(name => name[0]).join('').toUpperCase()}
          </div>
          
          <div style={styles.profileDetails}>
            <div style={styles.profileItem}>
              <label style={styles.label}>Name:</label>
              <span style={styles.value}>{user.name}</span>
            </div>
            
            <div style={styles.profileItem}>
              <label style={styles.label}>Aadhaar Number:</label>
              <span style={styles.value}>{user.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')}</span>
            </div>
            
            <div style={styles.profileItem}>
              <label style={styles.label}>User ID:</label>
              <span style={styles.value}>{user.id}</span>
            </div>
            
            {user.email && (
              <div style={styles.profileItem}>
                <label style={styles.label}>Email:</label>
                <span style={styles.value}>{user.email}</span>
              </div>
            )}
            
            {user.phone && (
              <div style={styles.profileItem}>
                <label style={styles.label}>Phone:</label>
                <span style={styles.value}>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h3>Session Information</h3>
          <p>You are currently logged in. Your session is active.</p>
          <p>Last login: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;