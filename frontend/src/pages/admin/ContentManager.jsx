import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaEnvelope, FaCalendarAlt, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

const CateringBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/catering/bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load catering bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdating(true);
    try {
      await api.put(`/catering/bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendQuote = async (bookingId) => {
    if (!quoteAmount) {
      toast.error('Please enter a quote amount');
      return;
    }

    setUpdating(true);
    try {
      await api.post(`/catering/bookings/${bookingId}/quote`, {
        amount: parseFloat(quoteAmount),
        message: quoteMessage
      });
      toast.success('Quote sent successfully!');
      setShowQuoteModal(false);
      setQuoteAmount('');
      setQuoteMessage('');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to send quote');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      quoted: 'info',
      cancelled: 'danger',
      completed: 'primary'
    };
    return variants[status] || 'secondary';
  };

  const getPackageName = (packageId) => {
    const packages = {
      1: 'Basic Package',
      2: 'Standard Package',
      3: 'Premium Package',
      4: 'Wedding Special'
    };
    return packages[packageId] || 'Custom Package';
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading catering bookings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Catering Bookings</h1>
        <Button variant="outline-primary" onClick={fetchBookings}>
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <p>No catering bookings yet.</p>
            <p className="text-muted">Customers can book catering from the website.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {bookings.map(booking => (
            <Col md={6} lg={4} className="mb-4" key={booking.id}>
              <Card className="shadow-sm h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>{booking.customerName}</strong>
                  <Badge bg={getStatusBadge(booking.status)}>
                    {booking.status?.toUpperCase()}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <FaCalendarAlt className="text-primary me-2" />
                    <strong>Event Date:</strong> {formatDate(booking.eventDate)}
                  </div>
                  <div className="mb-2">
                    <FaUsers className="text-primary me-2" />
                    <strong>Guests:</strong> {booking.guestCount}
                  </div>
                  <div className="mb-2">
                    <strong>Package:</strong> {getPackageName(booking.packageId)}
                  </div>
                  {booking.budget && (
                    <div className="mb-2">
                      <FaMoneyBillWave className="text-primary me-2" />
                      <strong>Budget:</strong> {formatCurrency(booking.budget)}
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Phone:</strong> {booking.phone}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {booking.email}
                  </div>
                  {booking.specialRequests && (
                    <div className="mt-2">
                      <strong>Special Requests:</strong>
                      <p className="text-muted small mt-1">{booking.specialRequests}</p>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <FaEye className="me-1" /> View Details
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline-success"
                          onClick={() => setShowQuoteModal(true) || setSelectedBooking(booking)}
                        >
                          <FaEnvelope className="me-1" /> Send Quote
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          disabled={updating}
                        >
                          <FaTimes className="me-1" /> Decline
                        </Button>
                      </>
                    )}
                    {booking.status === 'quoted' && (
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                        disabled={updating}
                      >
                        <FaCheck className="me-1" /> Confirm Booking
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* View Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Catering Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Customer Information</h6>
                  <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                  <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                  <p><strong>Email:</strong> {selectedBooking.email}</p>
                </Col>
                <Col md={6}>
                  <h6>Event Information</h6>
                  <p><strong>Type:</strong> {selectedBooking.eventType}</p>
                  <p><strong>Date:</strong> {formatDate(selectedBooking.eventDate)}</p>
                  <p><strong>Time:</strong> {selectedBooking.eventTime}</p>
                  <p><strong>Guests:</strong> {selectedBooking.guestCount}</p>
                </Col>
              </Row>
              <hr />
              <h6>Package Details</h6>
              <p><strong>Package:</strong> {getPackageName(selectedBooking.packageId)}</p>
              <p><strong>Budget:</strong> {formatCurrency(selectedBooking.budget)}</p>
              {selectedBooking.specialRequests && (
                <>
                  <h6>Special Requests</h6>
                  <p>{selectedBooking.specialRequests}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Send Quote Modal */}
      <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Quote to Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Quote Amount (UGX)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter quote amount"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any additional notes..."
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSendQuote(selectedBooking?.id)}
            disabled={updating}
          >
            {updating ? 'Sending...' : 'Send Quote'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CateringBookings;