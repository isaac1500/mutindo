import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <Alert variant="info" className="fixed-bottom m-3" style={{ zIndex: 9999, maxWidth: '400px', right: 0, left: 'auto' }}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <strong>Install App</strong>
          <br />
          <small>Install for faster access</small>
        </div>
        <Button size="sm" variant="primary" onClick={handleInstall}>
          <FaDownload /> Install
        </Button>
      </div>
    </Alert>
  );
};

export default InstallPrompt;