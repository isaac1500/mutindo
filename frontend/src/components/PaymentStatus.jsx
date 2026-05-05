import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const PaymentStatus = ({ status, amount, transactionId }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'completed':
        return {
          variant: 'success',
          icon: <FaCheckCircle size={24} />,
          title: 'Payment Successful!',
          message: `Your payment of ${amount} has been confirmed.`
        };
      case 'pending':
        return {
          variant: 'warning',
          icon: <FaClock size={24} />,
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait...'
        };
      case 'failed':
        return {
          variant: 'danger',
          icon: <FaTimesCircle size={24} />,
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.'
        };
      default:
        return {
          variant: 'info',
          icon: <Spinner animation="border" size="sm" />,
          title: 'Processing',
          message: 'Initiating payment...'
        };
    }
  };
  
  const display = getStatusDisplay();
  
  return (
    <Alert variant={display.variant} className="text-center">
      <div className="mb-2">{display.icon}</div>
      <h5>{display.title}</h5>
      <p>{display.message}</p>
      {transactionId && (
        <small className="text-muted">
          Transaction ID: {transactionId}
        </small>
      )}
    </Alert>
  );
};

export default PaymentStatus;