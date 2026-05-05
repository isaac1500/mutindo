import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { FaWifi } from 'react-icons/fa';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert variant="warning" className="fixed-top m-0 rounded-0 text-center" style={{ zIndex: 9999, top: '70px' }}>
      <FaWifi className="me-2" />
      You are offline. Some features may be limited.
    </Alert>
  );
};

export default OfflineIndicator;