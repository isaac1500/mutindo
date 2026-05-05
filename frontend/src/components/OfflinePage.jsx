import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaWifi, FaSync } from 'react-icons/fa';

const OfflinePage = () => {
  return (
    <Container className="text-center py-5">
      <FaWifi size={80} className="text-muted mb-4" />
      <h2>You're Offline</h2>
      <p className="text-muted">
        Please check your internet connection and try again.
      </p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        <FaSync className="me-2" /> Retry
      </Button>
    </Container>
  );
};

export default OfflinePage;