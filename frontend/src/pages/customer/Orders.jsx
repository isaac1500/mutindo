import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Spinner, Alert, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import api from '../../services/api';
import { FaEye, FaReceipt, FaRecycle, FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:    { label: 'Pending',          emoji: '⏳', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  confirmed:  { label: 'Confirmed',        emoji: '✅', color: '#6EC8A9', bg: 'rgba(110,200,169,0.12)', border: 'rgba(110,200,169,0.3)'  },
  preparing:  { label: 'Preparing',        emoji: '👨‍🍳', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  ready:      { label: 'Ready for Pickup', emoji: '🍽️', color: '#A96EC8', bg: 'rgba(169,110,200,0.12)', border: 'rgba(169,110,200,0.3)'  },
  picked_up:  { label: 'Picked Up',        emoji: '🛵', color: '#6EA9C8', bg: 'rgba(110,169,200,0.12)', border: 'rgba(110,169,200,0.3)'  },
  on_the_way: { label: 'On The Way',       emoji: '🚗', color: '#C8A96E', bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.3)'  },
  delivered:  { label: 'Delivered',        emoji: '✨', color: '#C8A96E', bg: 'rgba(200,169,110,0.15)', border: 'rgba(200,169,110,0.4)'  },
  cancelled:  { label: 'Cancelled',        emoji: '✕',  color: '#C86E6E', bg: 'rgba(200,110,110,0.12)', border: 'rgba(200,110,110,0.3)'  },
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (scoped under .orders-mutindo)
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  :root {
    --gold:      #C8A96E;
    --gold-dim:  #8a7249;
    --gold-pale: rgba(200,169,110,0.08);
    --obsidian:  #0a0907;
    --deep:      #0f0d0a;
    --surface:   #141209;
    --card-bg:   #181410;
    --border:    rgba(200,169,110,0.15);
    --text:      #e8e0d0;
    --muted:     #7a7060;
    --radius:    16px;
  }

  .orders-dubai {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    background: var(--obsidian);
    min-height: 100vh;
    color: var(--text);
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background glow */
  .orders-dubai::before {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(200,169,110,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── HEADER ── */
  .dxb-header {
    position: relative;
    z-index: 1;
    padding: 3.5rem 0 2.5rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 3rem;
  }

  .dxb-header .eyebrow {
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 10px;
  }

  .dxb-header h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 300;
    letter-spacing: -0.01em;
    color: var(--text);
    line-height: 1.05;
    margin: 0;
  }

  .dxb-header h1 em {
    font-style: italic;
    color: var(--gold);
  }

  .dxb-header .order-counter {
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--muted);
    background: rgba(200,169,110,0.06);
    border: 1px solid var(--border);
    padding: 6px 16px;
    border-radius: 30px;
  }

  /* ── ORNAMENT ── */
  .dxb-ornament {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 14px 0;
  }

  /* ── CARD ── */
  .dxb-card {
    background: var(--card-bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease !important;
    position: relative;
    box-shadow: 0 2px 20px rgba(0,0,0,0.4) !important;
    animation: cardReveal 0.5s ease both;
  }

  .dxb-card:hover {
    transform: translateY(-5px) !important;
    border-color: rgba(200,169,110,0.4) !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,169,110,0.08) !important;
  }

  /* Gold top stripe on hover */
  .dxb-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 2;
  }

  .dxb-card:hover::before {
    opacity: 1;
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Card header */
  .dxb-card .card-header {
    background: rgba(200,169,110,0.05) !important;
    border-bottom: 1px solid var(--border) !important;
    padding: 1rem 1.25rem !important;
  }

  .dxb-order-id {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.02em;
  }

  .dxb-order-id span {
    color: var(--gold);
    font-style: italic;
  }

  /* Status pill */
  .dxb-status {
    font-family: 'Jost', sans-serif;
    font-size: 10px !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: 5px 12px !important;
    border-radius: 20px !important;
    border: none !important;
  }

  /* Card body */
  .dxb-card .card-body {
    padding: 1.25rem !important;
    background: transparent !important;
  }

  .dxb-date {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.06em;
    margin-bottom: 1.1rem;
  }

  /* Items */
  .dxb-items-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dxb-items-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .dxb-item-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #b0a898;
    padding: 6px 0;
    border-bottom: 1px solid rgba(200,169,110,0.06);
  }

  .dxb-item-row:last-child { border-bottom: none; }

  .dxb-item-name { font-weight: 400; }
  .dxb-item-price { color: var(--muted); font-size: 12px; }

  .dxb-more-items {
    font-size: 11px;
    color: var(--muted);
    padding-top: 6px;
    letter-spacing: 0.04em;
  }

  /* Total */
  .dxb-total-block {
    margin-top: 1.1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dxb-total-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dxb-total-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.7rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: -0.02em;
    line-height: 1;
  }

  /* Action buttons */
  .dxb-actions {
    margin-top: 1.1rem;
    display: flex;
    gap: 8px;
  }

  .dxb-btn {
    flex: 1;
    font-family: 'Jost', sans-serif !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    padding: 8px 10px !important;
    border-radius: 8px !important;
    transition: all 0.2s ease !important;
    border-width: 1px !important;
  }

  .dxb-btn-gold {
    background: transparent !important;
    border-color: rgba(200,169,110,0.4) !important;
    color: var(--gold) !important;
  }

  .dxb-btn-gold:hover {
    background: rgba(200,169,110,0.1) !important;
    border-color: var(--gold) !important;
  }

  .dxb-btn-muted {
    background: transparent !important;
    border-color: rgba(255,255,255,0.1) !important;
    color: var(--muted) !important;
  }

  .dxb-btn-muted:hover {
    background: rgba(255,255,255,0.05) !important;
    border-color: rgba(255,255,255,0.2) !important;
    color: var(--text) !important;
  }

  .dxb-btn-reorder {
    background: linear-gradient(135deg, rgba(200,169,110,0.15), rgba(200,169,110,0.05)) !important;
    border-color: rgba(200,169,110,0.5) !important;
    color: var(--gold) !important;
  }

  .dxb-btn-reorder:hover {
    background: linear-gradient(135deg, rgba(200,169,110,0.25), rgba(200,169,110,0.1)) !important;
  }

  /* ── EMPTY STATE ── */
  .dxb-empty {
    text-align: center;
    padding: 6rem 2rem;
    position: relative;
    z-index: 1;
  }

  .dxb-empty-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    display: block;
    opacity: 0.5;
  }

  .dxb-empty h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 300;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .dxb-empty p {
    color: var(--muted);
    font-size: 14px;
    letter-spacing: 0.04em;
    margin-bottom: 2rem;
  }

  .dxb-browse-btn {
    font-family: 'Jost', sans-serif !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    letter-spacing: 0.2em !important;
    text-transform: uppercase !important;
    padding: 14px 36px !important;
    border-radius: 4px !important;
    background: linear-gradient(135deg, var(--gold), #a8893e) !important;
    border: none !important;
    color: var(--obsidian) !important;
    transition: all 0.3s ease !important;
  }

  .dxb-browse-btn:hover {
    box-shadow: 0 6px 24px rgba(200,169,110,0.3) !important;
    transform: translateY(-2px) !important;
  }

  /* ── LOADING ── */
  .dxb-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1.5rem;
  }

  .dxb-loading .spinner-border {
    color: var(--gold) !important;
    width: 32px;
    height: 32px;
    border-width: 1.5px;
  }

  .dxb-loading p {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0;
  }

  /* stagger card animations */
  .col-dxb:nth-child(1) .dxb-card { animation-delay: 0.05s; }
  .col-dxb:nth-child(2) .dxb-card { animation-delay: 0.12s; }
  .col-dxb:nth-child(3) .dxb-card { animation-delay: 0.19s; }
  .col-dxb:nth-child(4) .dxb-card { animation-delay: 0.26s; }
  .col-dxb:nth-child(5) .dxb-card { animation-delay: 0.33s; }
  .col-dxb:nth-child(6) .dxb-card { animation-delay: 0.40s; }

  /* error */
  .dxb-error .alert {
    background: rgba(200,110,110,0.08) !important;
    border: 1px solid rgba(200,110,110,0.25) !important;
    color: #e8a0a0 !important;
    border-radius: 12px !important;
    font-size: 14px;
  }
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();
  const { isAdmin, isRider }  = useAuth();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/orders' : '/orders/my-orders';
      const response = await api.get(endpoint);
      if (response.data.orders)           setOrders(response.data.orders);
      else if (Array.isArray(response.data)) setOrders(response.data);
      else                                   setOrders([]);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => STATUS_CONFIG[status] || { label: status, emoji: '·', color: '#7a7060', bg: 'rgba(122,112,96,0.1)', border: 'rgba(122,112,96,0.2)' };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      const cartItem = { id: item.id, name: item.name, price: item.price, image: item.image };
      window.dispatchEvent(new CustomEvent('addToCart', { detail: { item: cartItem, quantity: item.quantity } }));
    });
    navigate('/checkout');
  };

  const pageTitle = isAdmin ? 'All Orders' : isRider ? 'Delivery Orders' : 'My Orders';

  /* ── LOADING ── */
  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="orders-dubai">
        <Container>
          <div className="dxb-loading">
            <Spinner animation="border" />
            <p>Loading your orders</p>
          </div>
        </Container>
      </div>
    </>
  );

  /* ── ERROR ── */
  if (error) return (
    <>
      <style>{STYLES}</style>
      <div className="orders-dubai">
        <Container className="py-5 dxb-error">
          <Alert>{error}</Alert>
          <Button className="dxb-browse-btn" onClick={fetchOrders}>Try Again</Button>
        </Container>
      </div>
    </>
  );

  /* ── MAIN ── */
  return (
    <>
      <style>{STYLES}</style>
      <div className="orders-dubai">
        <Container style={{ position: 'relative', zIndex: 1 }}>

          {/* ── PAGE HEADER ── */}
          <div className="dxb-header">
            <Row className="align-items-end">
              <Col>
                <p className="eyebrow">Mutindi Catering Services · Order History</p>
                <div className="dxb-ornament" />
                <h1>
                  {isAdmin ? <>All <em>Orders</em></> : isRider ? <>Delivery <em>Queue</em></> : <>Your <em>Orders</em></>}
                </h1>
              </Col>
              {orders.length > 0 && (
                <Col xs="auto" className="d-flex align-items-end pb-1">
                  <span className="order-counter">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </span>
                </Col>
              )}
            </Row>
          </div>

          {/* ── EMPTY STATE ── */}
          {orders.length === 0 ? (
            <div className="dxb-empty">
              <span className="dxb-empty-icon">🍽</span>
              <div className="dxb-ornament mx-auto mb-3" />
              <h3>No orders yet</h3>
              <p>Your culinary journey begins with your first order.</p>
              <Button className="dxb-browse-btn" href="/menu">Explore the Menu</Button>
            </div>
          ) : (
            /* ── ORDER CARDS ── */
            <Row className="g-4 pb-5">
              {orders.map((order, idx) => {
                const st = getStatusStyle(order.status);
                return (
                  <Col md={6} lg={4} className="col-dxb" key={order.id}>
                    <Card className="dxb-card h-100">

                      {/* Header */}
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span className="dxb-order-id">
                          Order <span>#{order.id.slice(0, 8)}</span>
                        </span>
                        <span
                          className="dxb-status"
                          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                        >
                          {st.emoji} {st.label}
                        </span>
                      </Card.Header>

                      {/* Body */}
                      <Card.Body className="d-flex flex-column">

                        {/* Dates */}
                        <div className="dxb-date">
                          Placed {formatDate(order.createdAt)}
                          {order.deliveredAt && (
                            <span className="d-block">Delivered {formatDate(order.deliveredAt)}</span>
                          )}
                        </div>

                        {/* Items */}
                        <div className="mb-3">
                          <div className="dxb-items-label">Items</div>
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="dxb-item-row">
                              <span className="dxb-item-name">{item.name} × {item.quantity}</span>
                              <span className="dxb-item-price">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="dxb-more-items">+ {order.items.length - 3} more items</div>
                          )}
                        </div>

                        {/* Total */}
                        <div className="dxb-total-block mt-auto">
                          <span className="dxb-total-label">Order Total</span>
                          <span className="dxb-total-value">{formatCurrency(order.total)}</span>
                        </div>

                        {/* Actions */}
                        <div className="dxb-actions">
                          <Button
                            className="dxb-btn dxb-btn-gold"
                            onClick={() => navigate(`/tracking/${order.id}`)}
                          >
                            <FaEye className="me-1" /> Track
                          </Button>
                          <Button
                            className="dxb-btn dxb-btn-muted"
                            onClick={() => navigate(`/chat/${order.id}`)}
                          >
                            <FaReceipt className="me-1" /> Chat
                          </Button>
                          {order.status === 'delivered' && (
                            <Button
                              className="dxb-btn dxb-btn-reorder"
                              onClick={() => handleReorder(order)}
                            >
                              <FaRecycle className="me-1" /> Reorder
                            </Button>
                          )}
                        </div>

                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}

        </Container>
      </div>
    </>
  );
};

export default Orders;