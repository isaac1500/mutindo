import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Spinner, Alert, Button, ProgressBar, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import api from '../../services/api';
import { FaCheck, FaTruck, FaUtensils, FaBox, FaClock } from 'react-icons/fa';


// ─── Global Styles ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');

  :root {
    --gold:         #C8A96E;
    --gold-dim:     #8a7249;
    --gold-pale:    rgba(200,169,110,0.07);
    --gold-glow:    rgba(200,169,110,0.20);
    --obsidian:     #080705;
    --surface:      #0f0d0a;
    --card:         #131009;
    --card-raised:  #1a1510;
    --border:       rgba(200,169,110,0.13);
    --border-hover: rgba(200,169,110,0.35);
    --text:         #ede8df;
    --text-soft:    #b5a98e;
    --muted:        #6b6254;
    --danger:       #c86e6e;
    --success:      #6ec89a;
  }

  .dxb-tracking {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    min-height: 100vh;
    background: var(--obsidian);
    color: var(--text);
    padding: 44px 20px 80px;
    position: relative;
    overflow-x: hidden;
  }

  /* ambient gold glow */
  .dxb-tracking::before {
    content: '';
    position: fixed;
    top: -10%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: radial-gradient(ellipse, rgba(200,169,110,0.05) 0%, transparent 68%);
    pointer-events: none;
    z-index: 0;
  }

  .dxb-inner {
    max-width: 760px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* ── Animations ── */
  @keyframes dxbFadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dxbSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes dxbPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(200,169,110,0); }
  }
  @keyframes dxbStepIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dxb-animate { animation: dxbFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }

  /* ── Page Header ── */
  .dxb-header {
    text-align: center;
    margin-bottom: 2.8rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
  }

  .dxb-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }

  .dxb-ornament {
    width: 48px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 10px auto;
  }

  .dxb-page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 300;
    color: var(--text);
    letter-spacing: -0.01em;
    line-height: 1.05;
    margin-bottom: 8px;
  }

  .dxb-page-title em {
    font-style: italic;
    color: var(--gold);
  }

  .dxb-order-id-chip {
    display: inline-block;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 1rem;
    color: var(--muted);
    background: var(--gold-pale);
    border: 1px solid var(--border);
    padding: 5px 18px;
    border-radius: 30px;
    letter-spacing: 0.04em;
  }

  /* ── Card ── */
  .dxb-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 16px;
    transition: border-color 0.3s ease;
  }

  .dxb-card-body {
    padding: 28px 30px;
  }

  /* ── Status Badge ── */
  .dxb-status-badge {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    background: rgba(200,169,110,0.12);
    border: 1px solid rgba(200,169,110,0.3);
    color: var(--gold);
  }

  .dxb-status-badge.cancelled {
    background: rgba(200,110,110,0.12);
    border-color: rgba(200,110,110,0.3);
    color: var(--danger);
  }

  /* ── Progress Track ── */
  .dxb-progress-section {
    margin-bottom: 2rem;
  }

  .dxb-progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .dxb-progress-text {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dxb-progress-track {
    height: 3px;
    background: rgba(200,169,110,0.12);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 28px;
  }

  .dxb-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold-dim), var(--gold));
    border-radius: 2px;
    transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }

  .dxb-progress-fill::after {
    content: '';
    position: absolute;
    right: -1px;
    top: -3px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 10px rgba(200,169,110,0.6);
    animation: dxbPulse 2s ease infinite;
  }

  /* ── Step Track ── */
  .dxb-steps {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-bottom: 0;
  }

  .dxb-steps::before {
    content: '';
    position: absolute;
    top: 17px;
    left: 5%;
    right: 5%;
    height: 1px;
    background: var(--border);
    z-index: 0;
  }

  .dxb-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;
    z-index: 1;
    animation: dxbStepIn 0.4s ease both;
  }

  .dxb-step:nth-child(1) { animation-delay: 0.05s; }
  .dxb-step:nth-child(2) { animation-delay: 0.10s; }
  .dxb-step:nth-child(3) { animation-delay: 0.15s; }
  .dxb-step:nth-child(4) { animation-delay: 0.20s; }
  .dxb-step:nth-child(5) { animation-delay: 0.25s; }
  .dxb-step:nth-child(6) { animation-delay: 0.30s; }
  .dxb-step:nth-child(7) { animation-delay: 0.35s; }

  .dxb-step-node {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    border: 1.5px solid var(--border);
    background: var(--card);
    transition: all 0.3s ease;
  }

  .dxb-step-node.done {
    background: linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.08));
    border-color: rgba(200,169,110,0.5);
    box-shadow: 0 0 14px rgba(200,169,110,0.15);
  }

  .dxb-step-node.current {
    background: linear-gradient(135deg, #C8A96E, #9a7a3f);
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(200,169,110,0.35);
    animation: dxbPulse 2.5s ease infinite;
  }

  .dxb-step-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-align: center;
    color: var(--muted);
    transition: color 0.3s ease;
    line-height: 1.3;
  }

  .dxb-step-label.done    { color: var(--text-soft); }
  .dxb-step-label.current { color: var(--gold); font-weight: 600; }

  /* ── Divider ── */
  .dxb-divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  /* ── Section Label ── */
  .dxb-section-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dxb-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Delivery Info ── */
  .dxb-address-block p {
    font-size: 14px;
    color: var(--text-soft);
    margin: 0 0 4px;
    line-height: 1.5;
  }

  .dxb-address-block small {
    font-size: 12px;
    color: var(--muted);
  }

  /* ── Order Summary ── */
  .dxb-item-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-soft);
    padding: 5px 0;
    border-bottom: 1px solid rgba(200,169,110,0.06);
  }

  .dxb-item-row:last-child { border-bottom: none; }

  .dxb-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  .dxb-total-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dxb-total-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: -0.02em;
    line-height: 1;
  }

  /* ── Special Instructions ── */
  .dxb-instructions {
    background: var(--gold-pale);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 13px;
    color: var(--text-soft);
    font-style: italic;
    line-height: 1.6;
  }

  /* ── Action Buttons ── */
  .dxb-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .dxb-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 10px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.22s ease;
    border: none;
    outline: none;
    padding: 13px 28px;
  }

  .dxb-btn-gold {
    background: linear-gradient(135deg, #C8A96E, #9a7a3f);
    color: var(--obsidian);
    box-shadow: 0 4px 16px rgba(200,169,110,0.22);
  }

  .dxb-btn-gold:hover {
    box-shadow: 0 6px 24px rgba(200,169,110,0.38);
    transform: translateY(-1px);
  }

  .dxb-btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .dxb-btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: var(--gold-pale);
  }

  /* ── Loading & Error ── */
  .dxb-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1.25rem;
  }

  .dxb-spinner {
    animation: dxbSpin 0.8s linear infinite;
    color: var(--gold);
  }

  .dxb-loading-text {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .dxb-error-card {
    background: rgba(200,110,110,0.07);
    border: 1px solid rgba(200,110,110,0.22);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
    color: #e8a0a0;
    font-size: 14px;
    margin-bottom: 16px;
  }
`;


// ─── Spinner ──────────────────────────────────────────────────────────────────
const DxbSpinner = ({ size = 28 }) => (
  <svg className="dxb-spinner" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);


// ─── Status steps config ──────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'pending',    label: 'Placed',    emoji: '📋' },
  { key: 'confirmed',  label: 'Confirmed', emoji: '✦'  },
  { key: 'preparing',  label: 'Preparing', emoji: '🍳' },
  { key: 'ready',      label: 'Ready',     emoji: '🍽' },
  { key: 'picked_up',  label: 'Picked Up', emoji: '🛵' },
  { key: 'on_the_way', label: 'En Route',  emoji: '🚗' },
  { key: 'delivered',  label: 'Delivered', emoji: '✨' },
];


// ─── Tracking Component ───────────────────────────────────────────────────────
const Tracking = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Fetch order error:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status) => {
    const steps = STATUS_STEPS.map(s => s.key);
    const index = steps.indexOf(status);
    return index < 0 ? 0 : ((index + 1) / steps.length) * 100;
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="dxb-tracking">
        <div className="dxb-loading">
          <DxbSpinner />
          <p className="dxb-loading-text">Loading order details</p>
        </div>
      </div>
    </>
  );

  /* ── Error ── */
  if (error) return (
    <>
      <style>{STYLES}</style>
      <div className="dxb-tracking">
        <div className="dxb-inner dxb-animate" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div className="dxb-error-card">{error}</div>
          <button className="dxb-btn dxb-btn-gold" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>
    </>
  );

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === order?.status);
  const progress     = getStatusProgress(order?.status);
  const isCancelled  = order?.status === 'cancelled';

  return (
    <>
      <style>{STYLES}</style>
      <div className="dxb-tracking">
        <div className="dxb-inner dxb-animate">

          {/* ── Page Header ── */}
          <div className="dxb-header">
            <p className="dxb-eyebrow">Mutindo Catering Services · Live Updates</p>
            <div className="dxb-ornament" />
            <h1 className="dxb-page-title">Order <em>Tracking</em></h1>
            <div className="dxb-order-id-chip">
              #{orderId?.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* ── Main Tracking Card ── */}
          <div className="dxb-card">
            <div className="dxb-card-body">

              {/* Status header row */}
              <div className="dxb-progress-label" style={{ marginBottom: 16 }}>
                <span className="dxb-progress-text">Current Status</span>
                <span className={`dxb-status-badge ${isCancelled ? 'cancelled' : ''}`}>
                  {order?.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Progress bar */}
              {!isCancelled && (
                <div className="dxb-progress-section">
                  <div className="dxb-progress-track">
                    <div className="dxb-progress-fill" style={{ width: `${progress}%` }} />
                  </div>

                  {/* Step nodes */}
                  <div className="dxb-steps">
                    {STATUS_STEPS.map((step, idx) => {
                      const isDone    = idx < currentIndex;
                      const isCurrent = idx === currentIndex;
                      return (
                        <div key={step.key} className="dxb-step">
                          <div className={`dxb-step-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                            <span style={{ fontSize: isCurrent ? 15 : 13 }}>{step.emoji}</span>
                          </div>
                          <span className={`dxb-step-label ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="dxb-divider" />

              {/* ── Delivery & Summary ── */}
              <Row>
                <Col md={6} className="mb-4">
                  <div className="dxb-section-label">Delivery Address</div>
                  <div className="dxb-address-block">
                    <p>{order?.deliveryAddress}</p>
                    <small>📞 {order?.phone}</small>
                  </div>
                </Col>

                <Col md={6} className="mb-4">
                  <div className="dxb-section-label">Order Summary</div>
                  {order?.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="dxb-item-row">
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ color: 'var(--muted)' }}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order?.items?.length > 3 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', paddingTop: 6, letterSpacing: '0.04em' }}>
                      +{order.items.length - 3} more items
                    </div>
                  )}
                  <div className="dxb-total-row">
                    <span className="dxb-total-label">Order Total</span>
                    <span className="dxb-total-value">{formatCurrency(order?.total)}</span>
                  </div>
                </Col>
              </Row>

              {/* ── Special Instructions ── */}
              {order?.instructions && (
                <>
                  <div className="dxb-divider" />
                  <div className="dxb-section-label">Special Instructions</div>
                  <div className="dxb-instructions">"{order.instructions}"</div>
                </>
              )}

            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="dxb-actions" style={{ marginTop: 8 }}>
            <button className="dxb-btn dxb-btn-ghost" onClick={() => navigate('/orders')}>
              <FaBox size={11} /> All Orders
            </button>
            <button className="dxb-btn dxb-btn-gold" onClick={() => navigate(`/chat/${orderId}`)}>
              <FaTruck size={11} /> Contact Support
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Tracking;