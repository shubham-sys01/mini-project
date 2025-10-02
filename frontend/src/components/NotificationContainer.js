import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  // Listen for custom events to add notifications
  useEffect(() => {
    const handleNotification = (event) => {
      const { message, type, duration } = event.detail;
      addNotification(message, type, duration);
    };

    window.addEventListener('notification', handleNotification);
    
    return () => {
      window.removeEventListener('notification', handleNotification);
    };
  }, []);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Helper function to trigger notifications from anywhere in the app
export const notify = (message, type = 'info', duration = 5000) => {
  const event = new CustomEvent('notification', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationContainer;